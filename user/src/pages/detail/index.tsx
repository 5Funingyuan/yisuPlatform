import { Image, Picker, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import Taro, { usePageScroll, useRouter } from '@tarojs/taro'
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LiteIcon from '../../components/lite-icon'
import { addDays, getStayNights, getToday, normalizeDateRange, normalizeYmd, parseYmd } from '../../shared/date'
import { buildQueryString, safeDecode } from '../../shared/route'
import {
  QUERY_PAGE_PATH,
  buildListUrl,
  pickSearchContextFromParams,
} from '../../shared/search-context'
import {
  PRICE_OPTIONS,
  SCENE_OPTIONS,
} from '../../shared/search-options'
import {
  fetchHotelDetailPayload,
  refreshHotelRoomPrices,
  type DetailPagePayload,
  type HotelRoomFilter,
} from '../../services/hotel-detail-service'
import { useHotelDetailStore } from '../../store/hotelDetailStore'
import { useHotelListStore } from '../../store/hotelListStore'
import { useSearchDraftStore } from '../../store/search-draft'
import type { HotelDetailData, HotelRoomPlan } from './mock'
import './style.scss'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'] as const
const DEFAULT_ROOM_SUMMARY = '1间房 · 2成人'
const DeferredAdaptiveEmptyState = lazy(() =>
  import(/* webpackChunkName: "adaptive-empty-state" */ '../../components/adaptive/empty-state'),
)

const normalizeOption = <T extends readonly string[]>(value: string, options: T, fallback: T[number]) => {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback
}

const parseRoomProfile = (roomSummary: string) => {
  const roomMatched = roomSummary.match(/(\d+)\s*间房/)
  const adultMatched = roomSummary.match(/(\d+)\s*成人/)
  const childMatched = roomSummary.match(/(\d+)\s*儿童/)

  return {
    roomCount: Math.max(1, Number(roomMatched?.[1] || 1)),
    adultCount: Math.max(1, Number(adultMatched?.[1] || 2)),
    childCount: Math.max(0, Number(childMatched?.[1] || 0)),
  }
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

const formatDateWithWeek = (dateValue: string) => {
  const parsedDate = parseYmd(dateValue)

  if (!parsedDate) {
    return '--/--'
  }

  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')
  const week = WEEK_DAYS[parsedDate.getDay()]
  return `${month}/${day} 周${week}`
}

const formatThousands = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }

  return `${value}`
}

const buildInitialFilter = (priceValue: string): HotelRoomFilter => ({
  priceBucket: normalizeOption(priceValue, PRICE_OPTIONS, PRICE_OPTIONS[0]),
  breakfastOnly: false,
  cancellableOnly: false,
  bigBedOnly: false,
})

const sortByPrice = (plans: HotelRoomPlan[]) => [...plans].sort((left, right) => left.price - right.price)

const fallbackRoomSummary = (roomSummary: string) => roomSummary.trim() || DEFAULT_ROOM_SUMMARY

const renderSkeletonRows = () =>
  Array.from({ length: 3 }, (_, index) => (
    <View key={`detail-skeleton-${index}`} className='room-skeleton-card'>
      <View className='room-skeleton-cover shimmer' />
      <View className='room-skeleton-main'>
        <View className='skeleton-line shimmer w70' />
        <View className='skeleton-line shimmer w86' />
        <View className='skeleton-line shimmer w58' />
        <View className='skeleton-line shimmer w42' />
      </View>
      <View className='room-skeleton-side'>
        <View className='skeleton-line shimmer w30' />
        <View className='skeleton-line shimmer w60' />
        <View className='skeleton-btn shimmer' />
      </View>
    </View>
  ))

export default function HotelDetailPage() {
  const router = useRouter()
  const params = router.params || {}
  const routeSignature = JSON.stringify(params)

  const routeId = safeDecode(params.id)
  const routeHotelId = safeDecode(params.hotelId)
  const routeListItemId = safeDecode(params.listItemId || params.listitemid || params.itemId)
  const source = safeDecode(params.source)
  const hotelId = routeHotelId || routeId
  const listItemId = routeListItemId
  const routeScene = safeDecode(params.scene)
  const routeKeyword = safeDecode(params.keyword)
  const routePrice = safeDecode(params.price)
  const routeLocation = safeDecode(params.location)

  const draftScene = useSearchDraftStore((state) => state.scene)
  const draftKeyword = useSearchDraftStore((state) => state.keyword)
  const draftCheckIn = useSearchDraftStore((state) => state.checkInDate)
  const draftCheckOut = useSearchDraftStore((state) => state.checkOutDate)
  const patchSearchDraft = useSearchDraftStore((state) => state.patchDraft)

  const roomSummary = useHotelListStore((state) => fallbackRoomSummary(state.searchConditions.roomSummary))

  const selectedRoomPlan = useHotelDetailStore((state) => state.selectedRoomPlan)
  const pushRecentViewedHotel = useHotelDetailStore((state) => state.pushRecentViewedHotel)
  const syncHotelContext = useHotelDetailStore((state) => state.syncHotelContext)
  const setSelectedRoomPlan = useHotelDetailStore((state) => state.setSelectedRoomPlan)
  const patchBookingDraft = useHotelDetailStore((state) => state.patchBookingDraft)
  const clearSelectedRoomPlan = useHotelDetailStore((state) => state.clearSelectedRoomPlan)

  const activeScene = normalizeOption(routeScene || draftScene, SCENE_OPTIONS, SCENE_OPTIONS[0])
  const activeKeyword = routeKeyword || draftKeyword || ''

  const today = getToday()
  const initialCheckInInput = normalizeYmd(safeDecode(params.checkIn), draftCheckIn || today)
  const initialCheckOutInput = normalizeYmd(safeDecode(params.checkOut), draftCheckOut || addDays(initialCheckInInput, 1))
  const initialDateRange = normalizeDateRange(initialCheckInInput, initialCheckOutInput, today)

  const [checkInDate, setCheckInDate] = useState(initialDateRange.checkInDate)
  const [checkOutDate, setCheckOutDate] = useState(initialDateRange.checkOutDate)
  const [roomFilter, setRoomFilter] = useState<HotelRoomFilter>(() => buildInitialFilter(routePrice))

  const [hotel, setHotel] = useState<HotelDetailData | null>(null)
  const [roomPlans, setRoomPlans] = useState<HotelRoomPlan[]>([])
  const [priceHint, setPriceHint] = useState('')
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [priceRefreshing, setPriceRefreshing] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [isRouting, setIsRouting] = useState(false)
  const [stickyActive, setStickyActive] = useState(false)

  const requestTokenRef = useRef(0)
  const requestPayloadRef = useRef<(mode: 'initial' | 'filter' | 'refresh') => Promise<void>>()
  const hasLoadedRef = useRef(false)
  const stickyStateRef = useRef(false)

  const stayNights = getStayNights(checkInDate, checkOutDate)
  const roomProfile = useMemo(() => parseRoomProfile(roomSummary), [roomSummary])
  const sortedRoomPlans = useMemo(() => sortByPrice(roomPlans), [roomPlans])

  const listContext = useMemo(() => pickSearchContextFromParams(params), [routeSignature])
  const filterSignature = `${roomFilter.priceBucket}-${roomFilter.breakfastOnly}-${roomFilter.cancellableOnly}-${roomFilter.bigBedOnly}`

  const selectedPlanInCurrentHotel = useMemo(() => {
    if (!hotel || !selectedRoomPlan || selectedRoomPlan.hotelId !== hotel.id) {
      return null
    }

    return selectedRoomPlan
  }, [hotel, selectedRoomPlan])

  useEffect(() => {
    if (!hotelId) {
      return
    }

    syncHotelContext(hotelId)
  }, [hotelId, syncHotelContext])

  usePageScroll(({ scrollTop }) => {
    const nextSticky = scrollTop > 240

    if (nextSticky !== stickyStateRef.current) {
      stickyStateRef.current = nextSticky
      setStickyActive(nextSticky)
    }
  })

  useEffect(() => {
    patchSearchDraft({
      checkInDate,
      checkOutDate,
    })
  }, [checkInDate, checkOutDate, patchSearchDraft])

  useEffect(() => {
    if (!hotel) {
      return
    }

    patchBookingDraft({
      hotelId: hotel.id,
      hotelName: hotel.name,
      checkInDate,
      checkOutDate,
      nights: stayNights,
      roomCount: roomProfile.roomCount,
      adultCount: roomProfile.adultCount,
      childCount: roomProfile.childCount,
      scene: activeScene,
      keyword: activeKeyword,
      filter: roomFilter,
    })
  }, [
    activeKeyword,
    activeScene,
    checkInDate,
    checkOutDate,
    hotel,
    patchBookingDraft,
    roomFilter,
    roomProfile.adultCount,
    roomProfile.childCount,
    roomProfile.roomCount,
    stayNights,
  ])

  const syncSelectedPlanPrice = useCallback(
    (hotelData: HotelDetailData) => {
      const store = useHotelDetailStore.getState()
      const currentSelected = store.selectedRoomPlan

      if (!currentSelected || currentSelected.hotelId !== hotelData.id) {
        return
      }

      const matchedRoomPlan = hotelData.roomPlans.find((item) => item.id === currentSelected.roomPlanId)

      if (!matchedRoomPlan || matchedRoomPlan.stock <= 0) {
        store.clearSelectedRoomPlan()
        store.patchBookingDraft({
          selectedRoomPlanId: '',
          totalPrice: 0,
        })
        return
      }

      const totalPrice = matchedRoomPlan.price * stayNights * currentSelected.roomCount

      store.setSelectedRoomPlan({
        ...currentSelected,
        hotelName: hotelData.name,
        roomName: matchedRoomPlan.name,
        breakfast: matchedRoomPlan.breakfast,
        cancellable: matchedRoomPlan.cancellable,
        originalPrice: matchedRoomPlan.originalPrice,
        price: matchedRoomPlan.price,
        nights: stayNights,
        totalPrice,
      })

      store.patchBookingDraft({
        selectedRoomPlanId: matchedRoomPlan.id,
        nights: stayNights,
        totalPrice,
      })
    },
    [stayNights],
  )

  const applyPayload = useCallback(
    (payload: DetailPagePayload) => {
      const nextHotel = payload.hotel
      const sortedPlans = sortByPrice(payload.roomPlans)

      setHotel(nextHotel)
      setRoomPlans(sortedPlans)
      setPriceHint(payload.priceUpdateHint)
      setErrorText('')

      pushRecentViewedHotel({
        hotelId: nextHotel.id,
        name: nextHotel.name,
        address: nextHotel.address,
        rating: nextHotel.rating,
        coverImage: nextHotel.gallery[0]?.imageUrl || nextHotel.roomPlans[0]?.coverImage || '',
      })

      patchBookingDraft({
        hotelId: nextHotel.id,
        hotelName: nextHotel.name,
        checkInDate,
        checkOutDate,
        nights: stayNights,
        roomCount: roomProfile.roomCount,
        adultCount: roomProfile.adultCount,
        childCount: roomProfile.childCount,
        scene: activeScene,
        keyword: activeKeyword,
        filter: roomFilter,
      })

      syncSelectedPlanPrice(nextHotel)
    },
    [
      activeKeyword,
      activeScene,
      checkInDate,
      checkOutDate,
      patchBookingDraft,
      pushRecentViewedHotel,
      roomFilter,
      roomProfile.adultCount,
      roomProfile.childCount,
      roomProfile.roomCount,
      stayNights,
      syncSelectedPlanPrice,
    ],
  )

  const requestPayload = useCallback(
    async (mode: 'initial' | 'filter' | 'refresh') => {
      const requestToken = ++requestTokenRef.current
      setErrorText('')

      if (mode === 'initial') {
        setLoading(true)
      } else if (mode === 'filter') {
        setFilterLoading(true)
      } else {
        setPriceRefreshing(true)
      }

      try {
        const payload =
          mode === 'refresh'
            ? await refreshHotelRoomPrices(hotelId, roomFilter, listItemId)
            : await fetchHotelDetailPayload(hotelId, roomFilter, listItemId)

        if (requestToken !== requestTokenRef.current) {
          return
        }

        applyPayload(payload)
        hasLoadedRef.current = true
      } catch (error) {
        if (requestToken !== requestTokenRef.current) {
          return
        }

        setErrorText(error instanceof Error ? error.message : '详情加载失败，请稍后重试')
      } finally {
        if (requestToken === requestTokenRef.current) {
          setLoading(false)
          setFilterLoading(false)
          setPriceRefreshing(false)
        }
      }
    },
    [applyPayload, hotelId, listItemId, roomFilter],
  )

  useEffect(() => {
    requestPayloadRef.current = requestPayload
  }, [requestPayload])

  useEffect(() => {
    hasLoadedRef.current = false
    setHotel(null)
    setRoomPlans([])
    setGalleryIndex(0)
    setErrorText('')
  }, [hotelId])

  useEffect(() => {
    const mode = hasLoadedRef.current ? 'filter' : 'initial'
    void requestPayloadRef.current?.(mode)
  }, [hotelId, filterSignature])

  const syncDateRangeWithToday = () => {
    const latestToday = getToday()
    const normalizedRange = normalizeDateRange(checkInDate, checkOutDate, latestToday)

    if (normalizedRange.checkInDate !== checkInDate) {
      setCheckInDate(normalizedRange.checkInDate)
    }

    if (normalizedRange.checkOutDate !== checkOutDate) {
      setCheckOutDate(normalizedRange.checkOutDate)
    }

    return normalizedRange
  }

  const resolveListUrl = (nextCheckInDate: string, nextCheckOutDate: string) => {
    return buildListUrl({
      ...listContext,
      checkIn: nextCheckInDate,
      checkOut: nextCheckOutDate,
      source: 'detail',
    })
  }

  const handleGoBack = async () => {
    if (isRouting) {
      return
    }

    setIsRouting(true)

    try {
      const normalizedRange = syncDateRangeWithToday()
      const pages = Taro.getCurrentPages()

      if (pages.length > 1) {
        await Taro.navigateBack()
        return
      }

      const hasListContext = Object.keys(listContext).length > 0

      if (source === 'list' || hasListContext) {
        await Taro.reLaunch({
          url: resolveListUrl(normalizedRange.checkInDate, normalizedRange.checkOutDate),
        })
        return
      }

      await Taro.reLaunch({ url: QUERY_PAGE_PATH })
    } catch {
      Taro.showToast({ title: '页面跳转失败，请稍后重试', icon: 'none' })
    } finally {
      setIsRouting(false)
    }
  }

  const handleCheckInDateChange = (event: { detail: { value: string } }) => {
    const nextCheckInDate = normalizeYmd(event.detail.value, getToday())
    const normalizedRange = normalizeDateRange(nextCheckInDate, checkOutDate, getToday())

    setCheckInDate(normalizedRange.checkInDate)
    setCheckOutDate(normalizedRange.checkOutDate)
  }

  const handleCheckOutDateChange = (event: { detail: { value: string } }) => {
    const fallbackCheckOut = addDays(checkInDate, 1)
    const nextCheckOutDate = normalizeYmd(event.detail.value, fallbackCheckOut)
    const normalizedRange = normalizeDateRange(checkInDate, nextCheckOutDate, getToday())

    if (normalizedRange.checkOutDate !== nextCheckOutDate) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
    }

    setCheckInDate(normalizedRange.checkInDate)
    setCheckOutDate(normalizedRange.checkOutDate)
  }

  const handlePriceBucketSwitch = () => {
    setRoomFilter((prev) => {
      const currentIndex = PRICE_OPTIONS.findIndex((item) => item === prev.priceBucket)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % PRICE_OPTIONS.length

      return {
        ...prev,
        priceBucket: PRICE_OPTIONS[nextIndex],
      }
    })
  }

  const handleToggleFilter = (key: 'breakfastOnly' | 'cancellableOnly' | 'bigBedOnly') => {
    setRoomFilter((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleOpenFilterPage = async () => {
    try {
      const activeTags = [
        roomFilter.breakfastOnly ? '含早餐' : '',
        roomFilter.cancellableOnly ? '免费取消' : '',
        roomFilter.bigBedOnly ? '大床房' : '',
      ]
        .filter(Boolean)
        .join(',')

      const queryString = buildQueryString({
        tab: 'detail-filter',
        location: routeLocation || hotel?.mapLabel,
        scene: activeScene,
        star: safeDecode(params.star) || '不限',
        price: roomFilter.priceBucket,
        tags: activeTags || '-',
      })

      await Taro.navigateTo({ url: `/pages/filter/index?${queryString}` })
    } catch {
      Taro.showToast({ title: '筛选页打开失败', icon: 'none' })
    }
  }

  const handleSelectRoomPlan = (roomPlan: HotelRoomPlan) => {
    if (!hotel) {
      return
    }

    if (roomPlan.stock <= 0) {
      Taro.showToast({ title: '该房型当前无房', icon: 'none' })
      return
    }

    const totalPrice = roomPlan.price * stayNights * roomProfile.roomCount

    setSelectedRoomPlan({
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomPlanId: roomPlan.id,
      roomName: roomPlan.name,
      breakfast: roomPlan.breakfast,
      cancellable: roomPlan.cancellable,
      price: roomPlan.price,
      originalPrice: roomPlan.originalPrice,
      nights: stayNights,
      roomCount: roomProfile.roomCount,
      totalPrice,
    })

    patchBookingDraft({
      hotelId: hotel.id,
      hotelName: hotel.name,
      checkInDate,
      checkOutDate,
      nights: stayNights,
      roomCount: roomProfile.roomCount,
      adultCount: roomProfile.adultCount,
      childCount: roomProfile.childCount,
      scene: activeScene,
      keyword: activeKeyword,
      filter: roomFilter,
      selectedRoomPlanId: roomPlan.id,
      totalPrice,
    })

    Taro.showToast({ title: `已选中${roomPlan.name}`, icon: 'none' })
  }

  const handleClearRoomPlan = () => {
    clearSelectedRoomPlan()
    patchBookingDraft({
      selectedRoomPlanId: '',
      totalPrice: 0,
    })
  }

  const handleMockPay = () => {
    if (!selectedPlanInCurrentHotel) {
      return
    }

    patchBookingDraft({
      selectedRoomPlanId: selectedPlanInCurrentHotel.roomPlanId,
      totalPrice: selectedPlanInCurrentHotel.totalPrice,
    })

    Taro.showToast({ title: '进入支付确认（Mock）', icon: 'none' })
  }

  const handleResetFilter = () => {
    setRoomFilter(buildInitialFilter(PRICE_OPTIONS[0]))
  }

  const handleRetry = () => {
    void requestPayload(hasLoadedRef.current ? 'filter' : 'initial')
  }

  const hasRoomStock = sortedRoomPlans.some((item) => item.stock > 0)

  return (
    <View className='detail-page'>
      <View className='hero-wrap'>
        {hotel ? (
          <Swiper
            className='hero-swiper'
            circular
            autoplay
            interval={3600}
            duration={420}
            indicatorDots
            indicatorColor='rgba(255,255,255,0.35)'
            indicatorActiveColor='#ffffff'
            onChange={(event) => setGalleryIndex(event.detail.current)}
          >
            {hotel.gallery.map((item) => (
              <SwiperItem key={item.id}>
                <Image className='hero-image' src={item.imageUrl} mode='aspectFill' lazyLoad />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='hero-skeleton shimmer' />
        )}

        <View className='hero-mask' />

        <View className='detail-floating-nav'>
          <View className={`float-btn ${isRouting ? 'is-disabled' : ''}`} onClick={() => void handleGoBack()}>
            <LiteIcon value='chevron-left' size='18' color='#ffffff' />
          </View>

          <View className='float-actions'>
            <View
              className={`float-btn ${favorite ? 'is-active' : ''}`}
              onClick={() => {
                setFavorite((prev) => !prev)
              }}
            >
              <Text className='float-icon'>{favorite ? '★' : '☆'}</Text>
            </View>
            <View className='float-btn'>
              <Text className='float-icon'>···</Text>
            </View>
          </View>
        </View>

        {hotel ? (
          <View className='hero-caption'>
            <Text className='hero-tag'>{hotel.gallery[galleryIndex]?.title || '封面'}</Text>
            <Text className='hero-count'>
              {galleryIndex + 1}/{hotel.gallery.length}
            </Text>
          </View>
        ) : null}
      </View>

      <View className='detail-main'>
        <View className='hotel-info-card'>
          {hotel ? (
            <>
              <Text className='hotel-name'>{hotel.name}</Text>

              <View className='hotel-meta-row'>
                <View className='star-group'>
                  {Array.from({ length: getStarCount(hotel.star) }, (_, index) => (
                    <LiteIcon key={`${hotel.id}-star-${index}`} value='star-2' size='12' color='#f59e0b' />
                  ))}
                  <Text className='hotel-star-label'>{hotel.star}</Text>
                </View>

                <View className='rating-badge'>
                  <Text className='rating-value'>{hotel.rating.toFixed(1)}</Text>
                </View>

                <Text className='hotel-review'>{formatThousands(hotel.reviewCount)}点评</Text>
                <Text className='hotel-review'>{formatThousands(hotel.collectCount)}收藏</Text>
              </View>

              <View className='facility-row'>
                {hotel.facilities.slice(0, 6).map((item) => (
                  <Text key={item} className='facility-chip'>
                    {item}
                  </Text>
                ))}
              </View>

              <View className='location-row'>
                <View className='location-main'>
                  <LiteIcon value='map-pin' size='13' color='#475569' />
                  <Text className='location-text'>{hotel.address}</Text>
                </View>
                <View className='map-entry' onClick={() => setIsMapVisible(true)}>
                  <Text>地图</Text>
                </View>
              </View>
            </>
          ) : (
            <View className='info-skeleton-box'>{renderSkeletonRows().slice(0, 1)}</View>
          )}
        </View>

        <View className={`stay-bar-wrap ${stickyActive ? 'is-sticky' : ''}`}>
          <View className='stay-bar'>
            <View className='stay-date-group'>
              <Picker mode='date' value={checkInDate} start={today} onChange={handleCheckInDateChange}>
                <View className='stay-date-item'>
                  <Text className='stay-label'>入住</Text>
                  <Text className='stay-value'>{formatDateWithWeek(checkInDate)}</Text>
                </View>
              </Picker>

              <View className='stay-divider'>
                <LiteIcon value='subtract-circle' size='12' color='#94a3b8' />
              </View>

              <Picker mode='date' value={checkOutDate} start={addDays(checkInDate, 1)} onChange={handleCheckOutDateChange}>
                <View className='stay-date-item'>
                  <Text className='stay-label'>离店</Text>
                  <Text className='stay-value'>{formatDateWithWeek(checkOutDate)}</Text>
                </View>
              </Picker>
            </View>

            <View className='stay-right'>
              <Text className='stay-night-pill'>{stayNights}晚</Text>
              <Text className='stay-room-summary'>{roomSummary}</Text>
            </View>
          </View>
        </View>

        <View className='room-filter-row'>
          <View className='filter-chip is-price' onClick={handlePriceBucketSwitch}>
            <Text>{`价格 ${roomFilter.priceBucket}`}</Text>
          </View>

          <View
            className={`filter-chip ${roomFilter.breakfastOnly ? 'is-active' : ''}`}
            onClick={() => handleToggleFilter('breakfastOnly')}
          >
            <Text>早餐</Text>
          </View>

          <View
            className={`filter-chip ${roomFilter.cancellableOnly ? 'is-active' : ''}`}
            onClick={() => handleToggleFilter('cancellableOnly')}
          >
            <Text>可取消</Text>
          </View>

          <View
            className={`filter-chip ${roomFilter.bigBedOnly ? 'is-active' : ''}`}
            onClick={() => handleToggleFilter('bigBedOnly')}
          >
            <Text>大床房</Text>
          </View>

          <View className='filter-chip is-more' onClick={() => void handleOpenFilterPage()}>
            <Text>筛选</Text>
          </View>
        </View>

        <View className='price-tip-row'>
          <Text className='price-tip-text'>{priceHint || '价格与库存实时变动，请尽快确认房型'}</Text>
          <View className={`refresh-price-btn ${priceRefreshing ? 'is-loading' : ''}`} onClick={() => void requestPayload('refresh')}>
            <Text>{priceRefreshing ? '刷新中' : '刷新价格'}</Text>
          </View>
        </View>

        <View className='room-list-wrap'>
          {loading ? <View className='room-skeleton-wrap'>{renderSkeletonRows()}</View> : null}

          {!loading && errorText ? (
            <View className='section-feedback'>
              <Text className='feedback-text'>{errorText}</Text>
              <View className='feedback-btn' onClick={handleRetry}>
                <Text>重试</Text>
              </View>
            </View>
          ) : null}

          {!loading && !errorText && filterLoading ? (
            <View className='room-inline-loading'>
              <Text>筛选中...</Text>
            </View>
          ) : null}

          {!loading && !errorText && !filterLoading && sortedRoomPlans.length === 0 ? (
            <View className='section-feedback'>
              <Suspense fallback={<Text className='feedback-text'>当前筛选条件下暂无可售房型</Text>}>
                <DeferredAdaptiveEmptyState
                  title='当前筛选条件下暂无可售房型'
                  description='建议放宽价格档或取消早餐/可取消限制'
                />
              </Suspense>
              <View className='feedback-btn' onClick={handleResetFilter}>
                <Text>重置筛选</Text>
              </View>
            </View>
          ) : null}

          {!loading && !errorText && sortedRoomPlans.length > 0
            ? sortedRoomPlans.map((roomPlan) => {
                const isSoldOut = roomPlan.stock <= 0
                const isSelected = selectedPlanInCurrentHotel?.roomPlanId === roomPlan.id

                return (
                  <View key={roomPlan.id} className={`room-card ${isSelected ? 'is-selected' : ''}`}>
                    <Image className='room-cover' src={roomPlan.coverImage} mode='aspectFill' lazyLoad />

                    <View className='room-main'>
                      <View className='room-title-row'>
                        <Text className='room-name'>{roomPlan.name}</Text>
                        {isSoldOut ? <Text className='soldout-pill'>无房</Text> : null}
                      </View>

                      <Text className='room-spec'>
                        {roomPlan.area} · {roomPlan.bedType} · {roomPlan.guestText}
                      </Text>

                      <View className='room-tags'>
                        {roomPlan.tags.map((item) => (
                          <Text key={`${roomPlan.id}-${item}`} className='room-tag'>
                            {item}
                          </Text>
                        ))}
                      </View>

                      <Text className='room-policy'>
                        {roomPlan.breakfast} · {roomPlan.cancellable ? '免费取消' : '不可取消'}
                      </Text>
                    </View>

                    <View className='room-side'>
                      <Text className='room-original'>¥{roomPlan.originalPrice}</Text>
                      <Text className='room-price'>¥{roomPlan.price}</Text>
                      <Text className='room-price-tip'>每晚含税</Text>

                      <View
                        className={`book-btn ${isSoldOut ? 'is-disabled' : isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          handleSelectRoomPlan(roomPlan)
                        }}
                      >
                        <Text>{isSoldOut ? '无房' : isSelected ? '已选' : '订'}</Text>
                      </View>
                    </View>
                  </View>
                )
              })
            : null}
        </View>

        {!loading && !errorText && sortedRoomPlans.length > 0 && !hasRoomStock ? (
          <View className='section-alert'>
            <Text>当前展示房型均为无房态，可尝试更换入住日期或放宽筛选条件。</Text>
          </View>
        ) : null}
      </View>

      {selectedPlanInCurrentHotel ? (
        <View className='booking-bar'>
          <View className='booking-main'>
            <Text className='booking-room-name'>{selectedPlanInCurrentHotel.roomName}</Text>
            <Text className='booking-brief'>
              {selectedPlanInCurrentHotel.breakfast} · {selectedPlanInCurrentHotel.cancellable ? '免费取消' : '不可取消'} ·
              {selectedPlanInCurrentHotel.nights}晚
            </Text>
            <View className='booking-price-row'>
              <Text className='booking-total-label'>总价</Text>
              <Text className='booking-total-price'>¥{selectedPlanInCurrentHotel.totalPrice}</Text>
              <Text className='booking-tax-tip'>含税费</Text>
            </View>
          </View>

          <View className='booking-actions'>
            <View className='booking-clear-btn' onClick={handleClearRoomPlan}>
              <Text>取消</Text>
            </View>
            <View className='booking-pay-btn' onClick={handleMockPay}>
              <Text>去支付</Text>
            </View>
          </View>
        </View>
      ) : null}

      {isMapVisible && hotel ? (
        <View className='map-modal-mask' onClick={() => setIsMapVisible(false)}>
          <View
            className='map-modal-card'
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <Text className='map-modal-title'>地图预览（Mock）</Text>
            <Text className='map-modal-subtitle'>{hotel.mapLabel}</Text>
            <View className='map-modal-body'>
              <Text>{hotel.address}</Text>
              <Text>导航能力待接入真实地图 SDK</Text>
            </View>
            <View className='map-modal-btn' onClick={() => setIsMapVisible(false)}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
