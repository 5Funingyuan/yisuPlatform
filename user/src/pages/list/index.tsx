import { Image, Input, Picker, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useReachBottom, useRouter } from '@tarojs/taro'
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LiteIcon from '../../components/lite-icon'
import { addDays, getStayNights, getToday, normalizeDateRange, normalizeYmd, parseYmd } from '../../shared/date'
import { buildQueryString, decodeParam } from '../../shared/route'
import { buildDetailUrl, QUERY_PAGE_PATH } from '../../shared/search-context'
import { SCENE_OPTIONS } from '../../shared/search-options'
import { useHotelListStore } from '../../store/hotelListStore'
import { useSearchDraftStore } from '../../store/search-draft'
import {
  HOTEL_SORT_LABELS,
  buildQuickFilterOptions,
  fetchHotelListPage,
} from '../../services/hotel-list-service'
import { CITY_OPTIONS, ROOM_PROFILES } from '../query/entry-mock'
import type { HotelListItem } from './mock'
import './style.scss'

const PAGE_SIZE = 10
const DeferredAdaptiveEmptyState = lazy(() =>
  import(/* webpackChunkName: "adaptive-empty-state" */ '../../components/adaptive/empty-state'),
)

const SORT_TABS = [
  { key: 'recommend', label: '推荐排序' },
  { key: 'distance', label: '位置距离' },
  { key: 'price-star', label: '价格/星级' },
  { key: 'filter', label: '筛选' },
] as const

type SortTabKey = (typeof SORT_TABS)[number]['key']

const normalizeOption = <T extends readonly string[]>(value: string, options: T, fallback: T[number]) => {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback
}

const parseSelectedTags = (tagText: string) => {
  if (!tagText || tagText === '-') {
    return []
  }

  return tagText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const normalizeCityTitle = (cityText: string) => {
  const normalizedCity = cityText.trim()

  if (!normalizedCity || normalizedCity === '全国' || normalizedCity.startsWith('已定位')) {
    return '上海市'
  }

  return normalizedCity.endsWith('市') ? normalizedCity : `${normalizedCity}市`
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

const safeBackToQuery = async () => {
  const pages = Taro.getCurrentPages()

  if (pages.length > 1) {
    await Taro.navigateBack()
    return
  }

  await Taro.reLaunch({ url: QUERY_PAGE_PATH })
}

const hotelTagClassName = (tagText: string) => {
  if (tagText === '免费取消') {
    return 'hotel-info-tag is-blue'
  }

  if (tagText === '含早餐' || tagText === '高评分') {
    return 'hotel-info-tag is-orange'
  }

  return 'hotel-info-tag'
}

const sortItemClassName = (active: boolean) => (active ? 'hotel-sort-item is-active' : 'hotel-sort-item')
const quickFilterClassName = (active: boolean) => (active ? 'hotel-quick-chip is-active' : 'hotel-quick-chip')

export default function HotelListPage() {
  const router = useRouter()
  const routeParams = router.params || {}
  const routeSignature = JSON.stringify(routeParams)

  const draftScene = useSearchDraftStore((state) => state.scene)
  const draftKeyword = useSearchDraftStore((state) => state.keyword)
  const draftLocationName = useSearchDraftStore((state) => state.locationName)
  const draftStar = useSearchDraftStore((state) => state.selectedStar)
  const draftPrice = useSearchDraftStore((state) => state.selectedPrice)
  const draftTags = useSearchDraftStore((state) => state.selectedTags)
  const draftCheckInDate = useSearchDraftStore((state) => state.checkInDate)
  const draftCheckOutDate = useSearchDraftStore((state) => state.checkOutDate)
  const patchSearchDraft = useSearchDraftStore((state) => state.patchDraft)

  const searchConditions = useHotelListStore((state) => state.searchConditions)
  const sortType = useHotelListStore((state) => state.sortType)
  const selectedStar = useHotelListStore((state) => state.selectedStar)
  const selectedPrice = useHotelListStore((state) => state.selectedPrice)
  const selectedTags = useHotelListStore((state) => state.selectedTags)
  const selectedQuickFilters = useHotelListStore((state) => state.selectedQuickFilters)
  const cachedItems = useHotelListStore((state) => state.cachedItems)
  const total = useHotelListStore((state) => state.total)
  const pageNo = useHotelListStore((state) => state.pageNo)
  const pageSize = useHotelListStore((state) => state.pageSize)
  const hasMore = useHotelListStore((state) => state.hasMore)
  const cacheQueryKey = useHotelListStore((state) => state.cacheQueryKey)

  const initializeFromSearch = useHotelListStore((state) => state.initializeFromSearch)
  const patchSearchConditions = useHotelListStore((state) => state.patchSearchConditions)
  const setSortType = useHotelListStore((state) => state.setSortType)
  const toggleQuickFilter = useHotelListStore((state) => state.toggleQuickFilter)
  const sanitizeQuickFilters = useHotelListStore((state) => state.sanitizeQuickFilters)
  const resetRefinements = useHotelListStore((state) => state.resetRefinements)
  const replaceCache = useHotelListStore((state) => state.replaceCache)
  const appendCache = useHotelListStore((state) => state.appendCache)
  const clearCache = useHotelListStore((state) => state.clearCache)

  const [keywordInput, setKeywordInput] = useState('')
  const [initialLoading, setInitialLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pageError, setPageError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const fetchTokenRef = useRef(0)

  const cityTitle = useMemo(() => normalizeCityTitle(searchConditions.city), [searchConditions.city])
  const stayNights = getStayNights(searchConditions.checkInDate, searchConditions.checkOutDate)
  const quickFilterOptions = useMemo(() => buildQuickFilterOptions(cityTitle), [cityTitle])
  const quickFilterSignature = quickFilterOptions.join('|')
  const activeFilterCount =
    (selectedStar !== '不限' ? 1 : 0) +
    (selectedPrice !== '不限' ? 1 : 0) +
    selectedTags.length +
    selectedQuickFilters.length
  const hasPriceStarRefinement = selectedStar !== '不限' || selectedPrice !== '不限'

  const queryPayload = useMemo(
    () => ({
      scene: searchConditions.scene,
      city: cityTitle,
      keyword: searchConditions.keyword,
      checkInDate: searchConditions.checkInDate,
      checkOutDate: searchConditions.checkOutDate,
      selectedStar,
      selectedPrice,
      selectedTags,
      selectedQuickFilters,
      sortType,
    }),
    [
      cityTitle,
      searchConditions.checkInDate,
      searchConditions.checkOutDate,
      searchConditions.keyword,
      searchConditions.scene,
      selectedPrice,
      selectedQuickFilters,
      selectedStar,
      selectedTags,
      sortType,
    ],
  )
  const queryKey = JSON.stringify(queryPayload)

  useEffect(() => {
    const today = getToday()
    const routeSource = decodeParam(routeParams.source, '')
    const initialScene = normalizeOption(decodeParam(routeParams.scene, draftScene), SCENE_OPTIONS, SCENE_OPTIONS[0])
    const locationFromRoute = decodeParam(routeParams.location, draftLocationName || CITY_OPTIONS[0])
    const initialCity = normalizeCityTitle(
      locationFromRoute && !locationFromRoute.startsWith('已定位') ? locationFromRoute : draftLocationName || CITY_OPTIONS[0],
    )
    const keywordFromRoute = decodeParam(routeParams.keyword, draftKeyword || '')
    const initialKeyword = keywordFromRoute === '-' || keywordFromRoute === '不限' ? '' : keywordFromRoute
    const initialCheckInInput = normalizeYmd(decodeParam(routeParams.checkIn, draftCheckInDate || today), today)
    const checkOutFallback = draftCheckOutDate || addDays(initialCheckInInput, 1)
    const initialCheckOutInput = normalizeYmd(
      decodeParam(routeParams.checkOut, checkOutFallback),
      addDays(initialCheckInInput, 1),
    )
    const initialDateRange = normalizeDateRange(initialCheckInInput, initialCheckOutInput, today)
    const routeTags = parseSelectedTags(decodeParam(routeParams.tags, ''))
    const initialTags = routeTags.length > 0 ? routeTags : routeSource === 'query-home' ? [] : draftTags
    const roomProfile = ROOM_PROFILES[(initialCity.length + initialKeyword.length) % ROOM_PROFILES.length]
    const roomSummary = `${roomProfile.rooms}间房 · ${roomProfile.adults}成人${
      roomProfile.children > 0 ? ` ${roomProfile.children}儿童` : ''
    }`

    initializeFromSearch({
      scene: initialScene,
      city: initialCity,
      keyword: initialKeyword,
      checkInDate: initialDateRange.checkInDate,
      checkOutDate: initialDateRange.checkOutDate,
      roomSummary,
      selectedStar: decodeParam(routeParams.star, draftStar),
      selectedPrice: decodeParam(routeParams.price, draftPrice),
      selectedTags: initialTags,
    })

    setKeywordInput(initialKeyword)
  }, [routeSignature, initializeFromSearch])

  useEffect(() => {
    sanitizeQuickFilters(quickFilterOptions)
  }, [quickFilterSignature, quickFilterOptions, sanitizeQuickFilters])

  useEffect(() => {
    setKeywordInput(searchConditions.keyword)
  }, [searchConditions.keyword])

  useEffect(() => {
    patchSearchDraft({
      scene: searchConditions.scene,
      keyword: searchConditions.keyword,
      locationName: cityTitle,
      selectedStar,
      selectedPrice,
      selectedTags,
      checkInDate: searchConditions.checkInDate,
      checkOutDate: searchConditions.checkOutDate,
    })
  }, [
    cityTitle,
    patchSearchDraft,
    searchConditions.checkInDate,
    searchConditions.checkOutDate,
    searchConditions.keyword,
    searchConditions.scene,
    selectedPrice,
    selectedStar,
    selectedTags,
  ])

  const loadFirstPage = useCallback(
    async (forceReload: boolean) => {
      setLoadMoreError('')

      if (!forceReload && cacheQueryKey === queryKey && cachedItems.length > 0) {
        setPageError('')
        return
      }

      const currentToken = ++fetchTokenRef.current
      setInitialLoading(true)
      setPageError('')
      clearCache()

      try {
        const response = await fetchHotelListPage({
          ...queryPayload,
          pageNo: 1,
          pageSize: PAGE_SIZE,
        })

        if (currentToken !== fetchTokenRef.current) {
          return
        }

        replaceCache({
          queryKey,
          ...response,
        })
      } catch (error) {
        if (currentToken !== fetchTokenRef.current) {
          return
        }

        clearCache()
        setPageError(error instanceof Error ? error.message : '加载失败，请稍后重试')
      } finally {
        if (currentToken === fetchTokenRef.current) {
          setInitialLoading(false)
        }
      }
    },
    [cacheQueryKey, cachedItems.length, clearCache, queryKey, queryPayload, replaceCache],
  )

  useEffect(() => {
    void loadFirstPage(false)
  }, [loadFirstPage])

  const loadMore = useCallback(async () => {
    if (initialLoading || loadingMore || pageError || !hasMore) {
      return
    }

    setLoadingMore(true)
    setLoadMoreError('')

    try {
      const response = await fetchHotelListPage({
        ...queryPayload,
        pageNo: pageNo + 1,
        pageSize: pageSize || PAGE_SIZE,
      })

      appendCache({
        queryKey,
        ...response,
      })
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error.message : '加载更多失败')
    } finally {
      setLoadingMore(false)
    }
  }, [appendCache, hasMore, initialLoading, loadingMore, pageError, pageNo, pageSize, queryKey, queryPayload])

  useReachBottom(() => {
    void loadMore()
  })

  const handleBackToQuery = async () => {
    try {
      await safeBackToQuery()
    } catch {
      Taro.showToast({ title: '返回失败，请稍后重试', icon: 'none' })
    }
  }

  const openFilterPage = async (sourceTab: 'price-star' | 'filter') => {
    try {
      const queryString = buildQueryString({
        source: 'hotel-list',
        tab: sourceTab,
        scene: searchConditions.scene,
        location: cityTitle,
        checkIn: searchConditions.checkInDate,
        checkOut: searchConditions.checkOutDate,
        star: selectedStar,
        price: selectedPrice,
        tags: selectedTags.join(','),
      })
      await Taro.navigateTo({ url: `/pages/filter/index?${queryString}` })
    } catch {
      Taro.showToast({ title: '筛选页打开失败', icon: 'none' })
    }
  }

  const handleSortTabClick = (tabKey: SortTabKey) => {
    if (tabKey === 'recommend') {
      setSortType('recommend')
      return
    }

    if (tabKey === 'distance') {
      setSortType('distance')
      return
    }

    if (tabKey === 'price-star') {
      void openFilterPage('price-star')
      return
    }

    void openFilterPage('filter')
  }

  const handleKeywordSubmit = () => {
    const nextKeyword = keywordInput.trim()

    if (nextKeyword === searchConditions.keyword) {
      return
    }

    patchSearchConditions({ keyword: nextKeyword })
  }

  const handleCityChange = (event: { detail: { value: string } }) => {
    const cityIndex = Number(event.detail.value)
    const cityValue = CITY_OPTIONS[cityIndex] || cityTitle
    patchSearchConditions({ city: normalizeCityTitle(cityValue) })
  }

  const handleCheckInDateChange = (event: { detail: { value: string } }) => {
    const today = getToday()
    const nextCheckInDate = normalizeYmd(event.detail.value, today)
    const normalizedDateRange = normalizeDateRange(nextCheckInDate, searchConditions.checkOutDate, today)

    patchSearchConditions({
      checkInDate: normalizedDateRange.checkInDate,
      checkOutDate: normalizedDateRange.checkOutDate,
    })
  }

  const handleCheckOutDateChange = (event: { detail: { value: string } }) => {
    const fallbackCheckOutDate = addDays(searchConditions.checkInDate, 1)
    const nextCheckOutDate = normalizeYmd(event.detail.value, fallbackCheckOutDate)
    const normalizedDateRange = normalizeDateRange(searchConditions.checkInDate, nextCheckOutDate, getToday())

    if (nextCheckOutDate !== normalizedDateRange.checkOutDate) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
    }

    patchSearchConditions({
      checkInDate: normalizedDateRange.checkInDate,
      checkOutDate: normalizedDateRange.checkOutDate,
    })
  }

  const openHotelDetail = async (hotel: HotelListItem) => {
    try {
      const mergedTags = Array.from(new Set([...selectedTags, ...selectedQuickFilters]))
      const detailUrl = buildDetailUrl({
        id: hotel.itemId,
        hotelId: hotel.hotelId,
        listItemId: hotel.itemId,
        source: 'list',
        scene: searchConditions.scene,
        keyword: searchConditions.keyword || undefined,
        location: cityTitle,
        checkIn: searchConditions.checkInDate,
        checkOut: searchConditions.checkOutDate,
        star: selectedStar,
        price: selectedPrice,
        tags: mergedTags.length > 0 ? mergedTags.join(',') : undefined,
      })
      await Taro.navigateTo({ url: detailUrl })
    } catch {
      Taro.showToast({ title: '详情页打开失败', icon: 'none' })
    }
  }

  const renderRetryButton = (buttonText: string, onClick: () => void, type: 'primary' | 'default' = 'primary') => (
    <View className={`hotel-retry-button ${type === 'default' ? 'is-default' : ''}`} onClick={onClick}>
      <Text>{buttonText}</Text>
    </View>
  )

  const renderSkeletonCards = () => (
    <View className='hotel-skeleton-list'>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={`skeleton-${index}`} className='hotel-card skeleton-card'>
          <View className='hotel-card-cover skeleton-cover' />
          <View className='hotel-card-main'>
            <View className='skeleton-lines'>
              <View className='skeleton-line w72' />
              <View className='skeleton-line w90' />
              <View className='skeleton-line w78' />
              <View className='skeleton-line w55' />
            </View>
          </View>
        </View>
      ))}
    </View>
  )

  return (
    <View className='hotel-list-page'>
      <View className='hotel-top-nav'>
        <View className='hotel-nav-back' onClick={() => void handleBackToQuery()}>
          <LiteIcon value='chevron-left' size='18' color='#0f172a' />
        </View>
        <Text className='hotel-nav-title'>{cityTitle}</Text>
        <View className='hotel-nav-more'>···</View>
      </View>

      <View className='hotel-search-panel'>
        <View className='hotel-search-top'>
          <Picker mode='selector' range={[...CITY_OPTIONS]} onChange={handleCityChange}>
            <View className='hotel-city-pill'>
              <Text className='hotel-city-pill-text'>{cityTitle.replace(/市$/, '')}</Text>
              <Text className='hotel-city-pill-arrow'>▼</Text>
            </View>
          </Picker>

          <View className='hotel-date-room-pill'>
            <Picker mode='date' value={searchConditions.checkInDate} start={getToday()} onChange={handleCheckInDateChange}>
              <Text className='hotel-date-item'>{formatDateMd(searchConditions.checkInDate)}</Text>
            </Picker>
            <Text className='hotel-date-sep'>至</Text>
            <Picker mode='date' value={searchConditions.checkOutDate} start={addDays(searchConditions.checkInDate, 1)} onChange={handleCheckOutDateChange}>
              <Text className='hotel-date-item'>{formatDateMd(searchConditions.checkOutDate)}</Text>
            </Picker>
            <Text className='hotel-date-night'>{stayNights}晚</Text>
            <Text className='hotel-date-room'>{searchConditions.roomSummary}</Text>
          </View>
        </View>

        <View className='hotel-keyword-bar'>
          <LiteIcon value='search' size='14' color='#64748b' />
          <Input
            className='hotel-keyword-input'
            value={keywordInput}
            placeholder='位置 / 品牌 / 酒店名'
            placeholderClass='hotel-keyword-placeholder'
            confirmType='search'
            onInput={(event) => setKeywordInput(event.detail.value)}
            onConfirm={handleKeywordSubmit}
            onBlur={handleKeywordSubmit}
          />
          <View className='hotel-keyword-action' onClick={handleKeywordSubmit}>
            <Text className='hotel-keyword-action-text'>搜索</Text>
          </View>
        </View>

        <View className='hotel-search-summary'>
          <Text className='hotel-search-summary-text'>
            {searchConditions.scene} · {HOTEL_SORT_LABELS[sortType]} · {selectedStar}/{selectedPrice}
          </Text>
          <Text className='hotel-search-result-text'>{total}家可订</Text>
        </View>
      </View>

      <View className='hotel-sticky-panel'>
        <View className='hotel-sort-row'>
          {SORT_TABS.map((tabItem) => {
            const active =
              tabItem.key === 'recommend'
                ? sortType === 'recommend'
                : tabItem.key === 'distance'
                  ? sortType === 'distance'
                  : tabItem.key === 'price-star'
                    ? hasPriceStarRefinement
                    : activeFilterCount > 0

            return (
              <View
                key={tabItem.key}
                className={sortItemClassName(active)}
                onClick={() => handleSortTabClick(tabItem.key)}
              >
                <Text className='hotel-sort-text'>{tabItem.label}</Text>
                <Text className='hotel-sort-arrow'>▾</Text>
                {tabItem.key === 'filter' && activeFilterCount > 0 ? (
                  <View className='hotel-sort-count'>
                    <Text>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </View>
            )
          })}
        </View>

        <ScrollView className='hotel-quick-scroll' scrollX showScrollbar={false}>
          <View className='hotel-quick-list'>
            {quickFilterOptions.map((quickFilter) => (
              <View
                key={quickFilter}
                className={quickFilterClassName(selectedQuickFilters.includes(quickFilter))}
                onClick={() => toggleQuickFilter(quickFilter)}
              >
                <Text>{quickFilter}</Text>
              </View>
            ))}
            <View className='hotel-quick-reset' onClick={resetRefinements}>
              <Text>重置</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View className='hotel-list-content'>
        {initialLoading && cachedItems.length === 0 ? renderSkeletonCards() : null}

        {!initialLoading && pageError && cachedItems.length === 0 ? (
          <View className='hotel-error-state'>
            <Text className='hotel-error-title'>酒店列表加载失败</Text>
            <Text className='hotel-error-desc'>{pageError}</Text>
            {renderRetryButton('重试', () => {
              void loadFirstPage(true)
            })}
          </View>
        ) : null}

        {!initialLoading && !pageError && cachedItems.length === 0 ? (
          <Suspense fallback={<View className='hotel-empty-fallback'>暂无匹配酒店，请稍后重试</View>}>
            <DeferredAdaptiveEmptyState title='暂无匹配酒店' description='可尝试调整城市、关键词或筛选条件' />
          </Suspense>
        ) : null}

        {cachedItems.map((hotel) => (
          <View key={hotel.itemId} className='hotel-card' onClick={() => void openHotelDetail(hotel)}>
            <Image className='hotel-card-cover' mode='aspectFill' src={hotel.coverImage} lazyLoad />

            <View className='hotel-card-main'>
              <View className='hotel-card-title-row'>
                <Text className='hotel-card-title'>{hotel.name}</Text>
                <View className='hotel-score-badge'>
                  <Text>{hotel.rating.toFixed(1)}</Text>
                </View>
              </View>

              <View className='hotel-card-meta-row'>
                <Text className='hotel-card-stars'>{'★'.repeat(getStarCount(hotel.star))}</Text>
                <Text className='hotel-card-star-label'>{hotel.star}</Text>
                <Text className='hotel-card-dot'>·</Text>
                <Text className='hotel-card-meta-text'>{formatCount(hotel.reviewCount)}点评</Text>
                <Text className='hotel-card-meta-text'>{formatCount(hotel.collectCount)}收藏</Text>
              </View>

              <Text className='hotel-card-location'>{hotel.distance}</Text>
              <Text className='hotel-card-selling'>{hotel.specialDesc}</Text>

              <View className='hotel-card-tag-row'>
                {hotel.tags.slice(0, 4).map((tag) => {
                  return (
                    <Text key={`${hotel.itemId}-${tag}`} className={hotelTagClassName(tag)}>
                      {tag}
                    </Text>
                  )
                })}
              </View>

              <View className='hotel-card-bottom-row'>
                <View className='hotel-card-benefit'>
                  <Text className='hotel-benefit-main'>{hotel.bonusTag}</Text>
                  <Text className='hotel-benefit-sub'>
                    {hotel.roomType} · {hotel.breakfast}
                  </Text>
                </View>

                <View className='hotel-card-price'>
                  <Text className='hotel-price-original'>¥{hotel.originalPrice}</Text>
                  <View className='hotel-price-now-row'>
                    <Text className='hotel-price-now'>¥{hotel.price}</Text>
                    <Text className='hotel-price-unit'>起</Text>
                  </View>
                  <Text className='hotel-price-discount'>已省 ¥{hotel.originalPrice - hotel.price}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {cachedItems.length > 0 ? (
          <View className='hotel-list-footer'>
            {loadingMore ? <Text className='hotel-footer-main'>正在加载更多酒店...</Text> : null}

            {!loadingMore && loadMoreError ? (
              <View className='hotel-footer-error'>
                <Text className='hotel-footer-main'>{loadMoreError}</Text>
                {renderRetryButton(
                  '重试加载',
                  () => {
                    void loadMore()
                  },
                  'default',
                )}
              </View>
            ) : null}

            {!loadingMore && !loadMoreError && hasMore ? (
              <View className='hotel-footer-load-more'>
                <Text className='hotel-footer-main'>上滑自动加载更多</Text>
                {renderRetryButton(
                  '点击加载',
                  () => {
                    void loadMore()
                  },
                  'default',
                )}
              </View>
            ) : null}

            {!loadingMore && !loadMoreError && !hasMore ? (
              <Text className='hotel-footer-main'>已加载全部 {total} 家酒店</Text>
            ) : null}

            <Text className='hotel-footer-sub'>当前排序：{HOTEL_SORT_LABELS[sortType]} · 已启用筛选 {activeFilterCount} 项</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}
