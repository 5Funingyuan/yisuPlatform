import { View, Text, Input, Picker, Image } from '@tarojs/components'
import Taro, { useReachBottom, useRouter } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LiteIcon from '../../components/lite-icon'
import AdaptiveEmptyState from '../../components/adaptive/empty-state'
import { decodeParam } from '../../shared/route'
import { addDays, getStayNights, getToday, isDateRangeValid, normalizeDateRange, normalizeYmd, parseYmd } from '../../shared/date'
import { buildDetailUrl, QUERY_PAGE_PATH } from '../../shared/search-context'
import { useSearchDraftStore } from '../../store/search-draft'
import {
  FILTER_TAG_OPTIONS,
  HOTEL_LIST_POOL,
  PRICE_OPTIONS,
  SCENE_OPTIONS,
  SORT_OPTIONS,
  STAR_OPTIONS,
  type HotelListItem,
} from './mock'
import './style.scss'

const PAGE_SIZE = 8
const LOAD_DELAY = 380
const QUICK_STATIC_FILTERS = ['双床房', '含早餐', '返10倍积分', '免费取消'] as const
const DISTANCE_KEYWORDS = ['近古城门', '近洱海公园', '近双廊古镇', '近大理大学', '近崇圣寺三塔'] as const

const normalizeOption = <T extends readonly string[]>(value: string, options: T, fallback: T[number]) => {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback
}

const parseDistanceToMeter = (distanceText: string) => {
  const matchResult = distanceText.match(/(\d+(?:\.\d+)?)\s*(km|m)/i)

  if (matchResult) {
    const amount = Number(matchResult[1])
    const unit = matchResult[2].toLowerCase()
    return unit === 'km' ? amount * 1000 : amount
  }

  const distanceIndex = DISTANCE_KEYWORDS.findIndex((keyword) => distanceText.includes(keyword))
  return distanceIndex === -1 ? Number.MAX_SAFE_INTEGER : (distanceIndex + 1) * 100
}

const formatDateMd = (dateValue: string) => {
  const parsedDate = parseYmd(dateValue)

  if (!parsedDate) {
    return '--/--'
  }

  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')
  return `${month}-${day}`
}

const formatCount = (count: number) => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }

  return `${count}`
}

const getStarCount = (starLevel: string) => {
  if (starLevel === '豪华型') {
    return 5
  }

  if (starLevel === '高档型') {
    return 4
  }

  if (starLevel === '舒适型') {
    return 3
  }

  return 2
}

const isPriceMatched = (priceValue: number, selectedPrice: (typeof PRICE_OPTIONS)[number]) => {
  switch (selectedPrice) {
    case '¥0-200':
      return priceValue <= 200
    case '¥200-400':
      return priceValue > 200 && priceValue <= 400
    case '¥400-700':
      return priceValue > 400 && priceValue <= 700
    case '¥700+':
      return priceValue > 700
    default:
      return true
  }
}

const isQuickFilterMatched = (hotel: HotelListItem, quickFilter: string) => {
  if (quickFilter.endsWith('古城')) {
    return hotel.locationZone.includes('古城') || hotel.distance.includes('古城')
  }

  if (quickFilter === '双床房') {
    return hotel.roomType.includes('双床')
  }

  if (quickFilter === '含早餐') {
    return hotel.breakfast.includes('含')
  }

  if (quickFilter === '返10倍积分') {
    return hotel.bonusTag.includes('10倍')
  }

  if (quickFilter === '免费取消') {
    return hotel.freeCancel
  }

  return hotel.tags.includes(quickFilter) || hotel.locationZone.includes(quickFilter) || hotel.distance.includes(quickFilter)
}

const getRecommendScore = (hotel: HotelListItem, scene: (typeof SCENE_OPTIONS)[number]) => {
  const sceneScore =
    scene === '钟点房' ? (hotel.price <= 460 ? 8 : 0) : scene === '民宿' ? (hotel.tags.includes('亲子') ? 7 : 0) : 0

  return (
    hotel.rating * 25 +
    sceneScore +
    (hotel.freeCancel ? 8 : 0) +
    (hotel.breakfast.includes('含') ? 5 : 0) +
    (hotel.bonusTag.includes('10倍') ? 6 : 0) -
    hotel.price / 90 -
    parseDistanceToMeter(hotel.distance) / 1500
  )
}

const safeBackToQuery = async () => {
  const pages = Taro.getCurrentPages()

  if (pages.length > 1) {
    await Taro.navigateBack()
    return
  }

  await Taro.reLaunch({ url: QUERY_PAGE_PATH })
}

export default function HotelListPage() {
  const router = useRouter()
  const params = router.params || {}
  const draftScene = useSearchDraftStore((state) => state.scene)
  const draftKeyword = useSearchDraftStore((state) => state.keyword)
  const draftLocationName = useSearchDraftStore((state) => state.locationName)
  const draftStar = useSearchDraftStore((state) => state.selectedStar)
  const draftPrice = useSearchDraftStore((state) => state.selectedPrice)
  const draftTags = useSearchDraftStore((state) => state.selectedTags)
  const draftCheckInDate = useSearchDraftStore((state) => state.checkInDate)
  const draftCheckOutDate = useSearchDraftStore((state) => state.checkOutDate)
  const patchSearchDraft = useSearchDraftStore((state) => state.patchDraft)

  const initialToday = getToday()
  const fallbackCity = decodeParam(params.location, draftLocationName || '大理市')
  const normalizedInitialCity = fallbackCity && !fallbackCity.startsWith('已定位') ? fallbackCity : '大理市'
  const initialCheckInInput = normalizeYmd(decodeParam(params.checkIn, draftCheckInDate || initialToday), initialToday)
  const initialCheckOutFallback = draftCheckOutDate || addDays(initialCheckInInput, 1)
  const initialCheckOutInput = normalizeYmd(decodeParam(params.checkOut, initialCheckOutFallback), addDays(initialCheckInInput, 1))
  const initialDateRange = normalizeDateRange(initialCheckInInput, initialCheckOutInput, initialToday)
  const initialTagText = decodeParam(params.tags, '')
  const initialTagList =
    initialTagText && initialTagText !== '-'
      ? initialTagText
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : draftTags

  const [scene, setScene] = useState<(typeof SCENE_OPTIONS)[number]>(() =>
    normalizeOption(decodeParam(params.scene, draftScene), SCENE_OPTIONS, SCENE_OPTIONS[0]),
  )
  const [cityKeyword, setCityKeyword] = useState(normalizedInitialCity)
  const [keyword, setKeyword] = useState(() => decodeParam(params.keyword, draftKeyword))
  const [checkInDate, setCheckInDate] = useState(initialDateRange.checkInDate)
  const [checkOutDate, setCheckOutDate] = useState(initialDateRange.checkOutDate)
  const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]>(SORT_OPTIONS[0])
  const [selectedStar, setSelectedStar] = useState<(typeof STAR_OPTIONS)[number]>(() =>
    normalizeOption(decodeParam(params.star, draftStar), STAR_OPTIONS, STAR_OPTIONS[0]),
  )
  const [selectedPrice, setSelectedPrice] = useState<(typeof PRICE_OPTIONS)[number]>(() =>
    normalizeOption(decodeParam(params.price, draftPrice), PRICE_OPTIONS, PRICE_OPTIONS[0]),
  )
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>(initialTagList)
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([])
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stayNights = getStayNights(checkInDate, checkOutDate)
  const cityTitle = useMemo(() => {
    const normalized = cityKeyword.trim()

    if (!normalized || normalized === '全国' || normalized.startsWith('已定位')) {
      return '大理市'
    }

    return normalized.endsWith('市') ? normalized : `${normalized}市`
  }, [cityKeyword])

  const quickFilterOptions = useMemo(
    () => [`${cityTitle.replace(/市$/, '')}古城`, ...QUICK_STATIC_FILTERS] as string[],
    [cityTitle],
  )

  const filteredHotels = useMemo(() => {
    const normalizedCity = cityKeyword.trim()
    const normalizedKeyword = keyword.trim().toLowerCase()
    const shouldFilterCity = normalizedCity && normalizedCity !== '全国' && !normalizedCity.startsWith('已定位')

    const filtered = HOTEL_LIST_POOL.filter((hotel) => {
      if (shouldFilterCity) {
        const cityMatched = hotel.city.includes(normalizedCity) || hotel.address.includes(normalizedCity)
        if (!cityMatched) {
          return false
        }
      }

      if (normalizedKeyword) {
        const keywordMatched =
          hotel.name.toLowerCase().includes(normalizedKeyword) ||
          hotel.address.toLowerCase().includes(normalizedKeyword) ||
          hotel.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword)) ||
          hotel.specialDesc.toLowerCase().includes(normalizedKeyword)

        if (!keywordMatched) {
          return false
        }
      }

      if (selectedStar !== '不限' && hotel.star !== selectedStar) {
        return false
      }

      if (!isPriceMatched(hotel.price, selectedPrice)) {
        return false
      }

      if (selectedFilterTags.length > 0) {
        const hasMatchedTag = selectedFilterTags.some((tag) => hotel.tags.includes(tag))
        if (!hasMatchedTag) {
          return false
        }
      }

      if (selectedQuickFilters.length > 0) {
        const allQuickMatched = selectedQuickFilters.every((quickFilter) => isQuickFilterMatched(hotel, quickFilter))
        if (!allQuickMatched) {
          return false
        }
      }

      return true
    })

    return filtered.sort((left, right) => {
      if (selectedSort === '位置距离') {
        return parseDistanceToMeter(left.distance) - parseDistanceToMeter(right.distance) || right.rating - left.rating
      }

      if (selectedSort === '低价优先') {
        return left.price - right.price || right.rating - left.rating
      }

      if (selectedSort === '评分优先') {
        return right.rating - left.rating || right.reviewCount - left.reviewCount
      }

      return getRecommendScore(right, scene) - getRecommendScore(left, scene)
    })
  }, [cityKeyword, keyword, scene, selectedFilterTags, selectedPrice, selectedQuickFilters, selectedSort, selectedStar])

  const visibleHotels = useMemo(() => filteredHotels.slice(0, visibleCount), [filteredHotels, visibleCount])
  const hasMore = visibleCount < filteredHotels.length
  const activeFilterCount =
    (selectedStar !== '不限' ? 1 : 0) +
    (selectedPrice !== '不限' ? 1 : 0) +
    selectedFilterTags.length +
    selectedQuickFilters.length

  const clearLoadingTimer = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
  }

  const loadMoreHotels = useCallback(async () => {
    if (!hasMore || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    clearLoadingTimer()

    loadingTimerRef.current = setTimeout(() => {
      setVisibleCount((previousCount) => Math.min(previousCount + PAGE_SIZE, filteredHotels.length))
      setIsLoadingMore(false)
      loadingTimerRef.current = null
    }, LOAD_DELAY)
  }, [filteredHotels.length, hasMore, isLoadingMore])

  useReachBottom(() => {
    void loadMoreHotels()
  })

  useEffect(() => {
    clearLoadingTimer()
    setIsLoadingMore(false)
    setVisibleCount(Math.min(PAGE_SIZE, filteredHotels.length))
  }, [filteredHotels])

  useEffect(() => {
    return () => {
      clearLoadingTimer()
    }
  }, [])

  useEffect(() => {
    patchSearchDraft({
      scene,
      keyword,
      locationName: cityKeyword,
      selectedStar,
      selectedPrice,
      selectedTags: selectedFilterTags,
      checkInDate,
      checkOutDate,
    })
  }, [checkInDate, checkOutDate, cityKeyword, keyword, patchSearchDraft, scene, selectedFilterTags, selectedPrice, selectedStar])

  const handleSortTabClick = (sortTab: 'recommend' | 'distance' | 'price-star' | 'filter') => {
    if (sortTab === 'recommend') {
      setSelectedSort('欢迎度排序')
      return
    }

    if (sortTab === 'distance') {
      setSelectedSort('位置距离')
      return
    }

    if (sortTab === 'price-star') {
      setSelectedSort('低价优先')
      setShowAdvancedFilter(true)
      return
    }

    setShowAdvancedFilter((previous) => !previous)
  }

  const resetDetailedFilters = () => {
    setSelectedStar(STAR_OPTIONS[0])
    setSelectedPrice(PRICE_OPTIONS[0])
    setSelectedFilterTags([])
    setSelectedSort(SORT_OPTIONS[0])
  }

  const toggleAdvancedTag = (tag: string) => {
    setSelectedFilterTags((previous) => {
      if (previous.includes(tag)) {
        return previous.filter((item) => item !== tag)
      }
      return [...previous, tag]
    })
  }

  const toggleQuickFilter = (quickFilter: string) => {
    setSelectedQuickFilters((previous) => {
      if (previous.includes(quickFilter)) {
        return previous.filter((item) => item !== quickFilter)
      }
      return [...previous, quickFilter]
    })
  }

  const handleCheckInChange = (event: { detail: { value: string } }) => {
    const today = getToday()
    const nextCheckInDate = normalizeYmd(event.detail.value, today)
    const normalizedDateRange = normalizeDateRange(nextCheckInDate, checkOutDate, today)
    setCheckInDate(normalizedDateRange.checkInDate)
    setCheckOutDate(normalizedDateRange.checkOutDate)
  }

  const handleCheckOutChange = (event: { detail: { value: string } }) => {
    const fallbackCheckOutDate = addDays(checkInDate, 1)
    const nextCheckOutDate = normalizeYmd(event.detail.value, fallbackCheckOutDate)

    if (!isDateRangeValid(checkInDate, nextCheckOutDate)) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      setCheckOutDate(fallbackCheckOutDate)
      return
    }

    setCheckOutDate(nextCheckOutDate)
  }

  const openHotelDetail = async (hotel: HotelListItem) => {
    try {
      const mergedTags = Array.from(new Set([...selectedFilterTags, ...selectedQuickFilters]))
      const detailUrl = buildDetailUrl({
        id: hotel.hotelId,
        source: 'list',
        scene,
        keyword: keyword.trim() || undefined,
        location: cityKeyword.trim() || undefined,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        star: selectedStar,
        price: selectedPrice,
        tags: mergedTags.join(',') || undefined,
      })

      await Taro.navigateTo({ url: detailUrl })
    } catch {
      Taro.showToast({ title: '页面跳转失败，请稍后重试', icon: 'none' })
    }
  }

  const handleBackToQuery = async () => {
    try {
      await safeBackToQuery()
    } catch {
      Taro.showToast({ title: '返回失败，请稍后重试', icon: 'none' })
    }
  }

  return (
    <View className='list-page'>
      <View className='top-nav'>
        <View className='nav-back' onClick={() => void handleBackToQuery()}>
          <LiteIcon value='chevron-left' size='18' color='#0f172a' />
        </View>
        <Text className='nav-title'>{cityTitle}</Text>
        <View className='nav-actions'>
          <Text className='nav-action'>···</Text>
          <Text className='nav-action'>◎</Text>
        </View>
      </View>

      <View className='core-condition'>
        <View className='core-top'>
          <View className='city-pill'>
            <Text>{cityTitle}</Text>
          </View>

          <View className='date-pill'>
            <Picker mode='date' value={checkInDate} start={getToday()} onChange={handleCheckInChange}>
              <Text className='date-item'>{formatDateMd(checkInDate)}</Text>
            </Picker>
            <Picker mode='date' value={checkOutDate} start={addDays(checkInDate, 1)} onChange={handleCheckOutChange}>
              <Text className='date-item'>{formatDateMd(checkOutDate)}</Text>
            </Picker>
          </View>

          <View className='night-pill'>
            <Text className='night-top'>1间</Text>
            <Text className='night-bottom'>{stayNights}晚</Text>
          </View>
        </View>

        <View className='search-bar'>
          <LiteIcon value='search' size='14' color='#64748b' />
          <Input
            className='search-input'
            value={keyword}
            placeholder='位置/品牌/酒店'
            placeholderClass='search-placeholder'
            onInput={(event) => setKeyword(event.detail.value)}
          />
          <View className='map-entry'>
            <LiteIcon value='map-pin' size='13' color='#64748b' />
            <Text>地图</Text>
          </View>
        </View>

        <View className='setting-row'>
          <Text className='setting-text'>
            搜索设置：{scene} · {selectedSort} · {selectedStar}/{selectedPrice}
          </Text>
          <Text className='result-text'>{filteredHotels.length}家</Text>
        </View>
      </View>

      <View className='sort-row'>
        <View
          className={`sort-item ${selectedSort === '欢迎度排序' ? 'active' : ''}`}
          onClick={() => handleSortTabClick('recommend')}
        >
          <Text>欢迎度排序</Text>
          <Text className='sort-arrow'>▾</Text>
        </View>

        <View
          className={`sort-item ${selectedSort === '位置距离' ? 'active' : ''}`}
          onClick={() => handleSortTabClick('distance')}
        >
          <Text>位置距离</Text>
          <Text className='sort-arrow'>▾</Text>
        </View>

        <View
          className={`sort-item ${selectedSort === '低价优先' || selectedSort === '评分优先' ? 'active' : ''}`}
          onClick={() => handleSortTabClick('price-star')}
        >
          <Text>价格/星级</Text>
          <Text className='sort-arrow'>▾</Text>
        </View>

        <View className={`sort-item ${showAdvancedFilter ? 'active' : ''}`} onClick={() => handleSortTabClick('filter')}>
          <Text>筛选</Text>
          <Text className='sort-arrow'>▾</Text>
        </View>
      </View>

      <View className='quick-filter-row'>
        {quickFilterOptions.map((option) => (
          <View
            key={option}
            className={`quick-chip ${selectedQuickFilters.includes(option) ? 'active' : ''}`}
            onClick={() => toggleQuickFilter(option)}
          >
            <Text>{option}</Text>
          </View>
        ))}
      </View>

      {showAdvancedFilter ? (
        <View className='advanced-filter'>
          <View className='advanced-head'>
            <Text className='advanced-title'>详细筛选区域</Text>
            <View className='reset-btn' onClick={resetDetailedFilters}>
              <Text>重置</Text>
            </View>
          </View>

          <Text className='group-title'>场景</Text>
          <View className='chip-row'>
            {SCENE_OPTIONS.map((option) => (
              <View key={option} className={`chip ${scene === option ? 'active' : ''}`} onClick={() => setScene(option)}>
                <Text>{option}</Text>
              </View>
            ))}
          </View>

          <Text className='group-title'>排序策略</Text>
          <View className='chip-row'>
            {SORT_OPTIONS.map((option) => (
              <View key={option} className={`chip ${selectedSort === option ? 'active' : ''}`} onClick={() => setSelectedSort(option)}>
                <Text>{option}</Text>
              </View>
            ))}
          </View>

          <Text className='group-title'>星级</Text>
          <View className='chip-row'>
            {STAR_OPTIONS.map((option) => (
              <View key={option} className={`chip ${selectedStar === option ? 'active' : ''}`} onClick={() => setSelectedStar(option)}>
                <Text>{option}</Text>
              </View>
            ))}
          </View>

          <Text className='group-title'>价格</Text>
          <View className='chip-row'>
            {PRICE_OPTIONS.map((option) => (
              <View key={option} className={`chip ${selectedPrice === option ? 'active' : ''}`} onClick={() => setSelectedPrice(option)}>
                <Text>{option}</Text>
              </View>
            ))}
          </View>

          <Text className='group-title'>特色标签</Text>
          <View className='chip-row'>
            {FILTER_TAG_OPTIONS.map((option) => (
              <View
                key={option}
                className={`chip ${selectedFilterTags.includes(option) ? 'active' : ''}`}
                onClick={() => toggleAdvancedTag(option)}
              >
                <Text>{option}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className='hotel-list'>
        {visibleHotels.length > 0 ? (
          visibleHotels.map((hotel) => (
            <View key={hotel.itemId} className='hotel-card' onClick={() => void openHotelDetail(hotel)}>
              <Image className='hotel-image' mode='aspectFill' src={hotel.coverImage} lazyLoad />

              <View className='hotel-main'>
                <Text className='hotel-name'>{hotel.name}</Text>

                <View className='hotel-star-row'>
                  <Text className='hotel-stars'>{'◆'.repeat(getStarCount(hotel.star))}</Text>
                  <Text className='hotel-star-label'>{hotel.star}</Text>
                </View>

                <View className='hotel-score-row'>
                  <Text className='score-pill'>{hotel.rating.toFixed(1)}</Text>
                  <Text className='score-detail'>
                    超棒 | {formatCount(hotel.reviewCount)}点评 · {formatCount(hotel.collectCount)}收藏
                  </Text>
                </View>

                <Text className='hotel-distance'>{hotel.distance}</Text>
                <Text className='hotel-special'>{hotel.specialDesc}</Text>

                <View className='hotel-tag-row'>
                  {hotel.tags.slice(0, 4).map((tag) => (
                    <Text key={`${hotel.itemId}-${tag}`} className='tag-pill'>
                      {tag}
                    </Text>
                  ))}
                </View>

                <View className='hotel-bottom-row'>
                  <View className='bonus-info'>
                    <Text className='bonus-tag'>{hotel.bonusTag}</Text>
                    <Text className='bonus-sub'>
                      {hotel.roomType} · {hotel.breakfast}
                    </Text>
                  </View>

                  <View className='price-info'>
                    <Text className='old-price'>¥{hotel.originalPrice}</Text>
                    <View className='new-price-row'>
                      <Text className='new-price'>¥{hotel.price}</Text>
                      <Text className='new-price-unit'>起</Text>
                    </View>
                    <Text className='discount-tip'>门店价 优惠{hotel.originalPrice - hotel.price}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <AdaptiveEmptyState title='暂无匹配酒店' description='可尝试调整城市、价格或筛选条件' />
        )}
      </View>

      {visibleHotels.length > 0 ? (
        <View className='loading-footer'>
          {isLoadingMore ? (
            <Text>正在加载更多酒店...</Text>
          ) : hasMore ? (
            <View className='load-more-btn' onClick={() => void loadMoreHotels()}>
              <Text>上滑自动加载，或点击继续加载</Text>
            </View>
          ) : (
            <Text>已展示全部酒店</Text>
          )}
          <Text className='footer-sub'>当前筛选共 {activeFilterCount} 项</Text>
        </View>
      ) : null}
    </View>
  )
}
