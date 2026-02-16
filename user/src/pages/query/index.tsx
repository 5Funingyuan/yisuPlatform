import { ScrollView, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { addDays, getStayNights, getToday, isDateRangeValid, normalizeDateRange, parseYmd } from '../../shared/date'
import { buildQueryString } from '../../shared/route'
import { buildDetailUrl } from '../../shared/search-context'
import { SCENE_OPTIONS } from '../../shared/search-options'
import { useSearchDraftStore } from '../../store/search-draft'
import {
  BOTTOM_NAV_ITEMS,
  CITY_OPTIONS,
  COUPON_CONTENT,
  MARKETING_BANNERS,
  QUICK_ENTRIES,
  ROOM_PROFILES,
} from './entry-mock'
import BannerCarousel from './components/banner-carousel'
import SearchFormCard, { type SearchFieldKey } from './components/search-form-card'
import './style.scss'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'] as const
const DeferredOperationPanel = lazy(() =>
  import(/* webpackChunkName: "query-operation-panel" */ './components/operation-panel'),
)
const DeferredBottomNav = lazy(() => import(/* webpackChunkName: "query-bottom-nav" */ './components/bottom-nav'))

const formatDateLabel = (dateValue: string, todayValue: string) => {
  const parsedDate = parseYmd(dateValue)

  if (!parsedDate) {
    return '-- --/--'
  }

  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')
  const weekText = `周${WEEK_DAYS[parsedDate.getDay()]}`

  if (dateValue === todayValue) {
    return `今 ${month}/${day}`
  }

  if (dateValue === addDays(todayValue, 1)) {
    return `明 ${month}/${day}`
  }

  return `${weekText} ${month}/${day}`
}

export default function QueryPage() {
  const persistedScene = useSearchDraftStore((state) => state.scene)
  const persistedKeyword = useSearchDraftStore((state) => state.keyword)
  const persistedLocationName = useSearchDraftStore((state) => state.locationName)
  const persistedStar = useSearchDraftStore((state) => state.selectedStar)
  const persistedPrice = useSearchDraftStore((state) => state.selectedPrice)
  const persistedCheckInDate = useSearchDraftStore((state) => state.checkInDate)
  const persistedCheckOutDate = useSearchDraftStore((state) => state.checkOutDate)
  const patchSearchDraft = useSearchDraftStore((state) => state.patchDraft)
  const syncSearchDateRange = useSearchDraftStore((state) => state.syncDateRange)

  const initialToday = getToday()
  const initialDateRange = normalizeDateRange(
    persistedCheckInDate || initialToday,
    persistedCheckOutDate || addDays(initialToday, 1),
    initialToday,
  )
  const defaultCity = CITY_OPTIONS.includes(persistedLocationName as (typeof CITY_OPTIONS)[number])
    ? persistedLocationName
    : CITY_OPTIONS[0]

  const [today, setToday] = useState(initialToday)
  const [activeScene, setActiveScene] = useState<(typeof SCENE_OPTIONS)[number]>(persistedScene)
  const [activeField, setActiveField] = useState<SearchFieldKey>('keyword')
  const [cityValue, setCityValue] = useState(defaultCity)
  const [keyword, setKeyword] = useState(persistedKeyword || '')
  const [checkInDate, setCheckInDate] = useState(initialDateRange.checkInDate)
  const [checkOutDate, setCheckOutDate] = useState(initialDateRange.checkOutDate)
  const [roomProfileIndex, setRoomProfileIndex] = useState(0)
  const [bottomNav, setBottomNav] = useState<(typeof BOTTOM_NAV_ITEMS)[number]>(BOTTOM_NAV_ITEMS[0])
  const [deferredModulesReady, setDeferredModulesReady] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [queryPressing, setQueryPressing] = useState(false)

  const stayNights = getStayNights(checkInDate, checkOutDate)
  const roomProfile = ROOM_PROFILES[roomProfileIndex % ROOM_PROFILES.length]
  const roomSummary = `${roomProfile.rooms}间房 · ${roomProfile.adults}成人${roomProfile.children > 0 ? ` ${roomProfile.children}儿童` : ''}`
  const filterSummary = `${persistedPrice}/${persistedStar}`
  const checkInText = formatDateLabel(checkInDate, today)
  const checkOutText = formatDateLabel(checkOutDate, today)

  useEffect(() => {
    syncSearchDateRange()
  }, [syncSearchDateRange])

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setDeferredModulesReady(true)
    }, 120)

    return () => {
      clearTimeout(mountTimer)
    }
  }, [])

  useEffect(() => {
    patchSearchDraft({
      scene: activeScene,
      keyword,
      locationName: cityValue,
      checkInDate,
      checkOutDate,
      selectedStar: persistedStar,
      selectedPrice: persistedPrice,
    })
  }, [
    activeScene,
    checkInDate,
    checkOutDate,
    cityValue,
    keyword,
    patchSearchDraft,
    persistedPrice,
    persistedStar,
  ])

  const updateDateRange = (nextCheckInDate: string, nextCheckOutDate: string) => {
    const latestToday = getToday()
    const normalizedRange = normalizeDateRange(nextCheckInDate, nextCheckOutDate, latestToday)
    setToday(latestToday)
    setCheckInDate(normalizedRange.checkInDate)
    setCheckOutDate(normalizedRange.checkOutDate)
  }

  const handleLocate = async () => {
    if (isLocating) {
      return
    }

    setIsLocating(true)
    try {
      const location = await Taro.getLocation({ type: 'gcj02' })
      const latitude = Number(location.latitude).toFixed(3)
      const longitude = Number(location.longitude).toFixed(3)
      setKeyword(`附近酒店 ${latitude},${longitude}`)
      Taro.showToast({ title: '已定位附近酒店', icon: 'none' })
    } catch {
      Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' })
    } finally {
      setIsLocating(false)
    }
  }

  const handleSearch = async () => {
    if (isSearching) {
      return
    }

    setQueryPressing(false)
    const latestToday = getToday()
    const normalizedRange = normalizeDateRange(checkInDate, checkOutDate, latestToday)
    setToday(latestToday)
    setCheckInDate(normalizedRange.checkInDate)
    setCheckOutDate(normalizedRange.checkOutDate)

    if (!isDateRangeValid(normalizedRange.checkInDate, normalizedRange.checkOutDate)) {
      Taro.showToast({ title: '日期选择有误', icon: 'none' })
      return
    }

    const queryString = buildQueryString({
      source: 'query-home',
      scene: activeScene,
      keyword: keyword.trim() || undefined,
      location: cityValue,
      checkIn: normalizedRange.checkInDate,
      checkOut: normalizedRange.checkOutDate,
      star: persistedStar,
      price: persistedPrice,
    })

    setIsSearching(true)
    try {
      await Taro.navigateTo({ url: `/pages/list/index?${queryString}` })
    } catch {
      Taro.showToast({ title: '跳转失败，请重试', icon: 'none' })
    } finally {
      setIsSearching(false)
    }
  }

  const openBannerTarget = async (bannerHotelId: string) => {
    const detailUrl = buildDetailUrl({
      id: bannerHotelId,
      source: 'query',
      checkIn: checkInDate,
      checkOut: checkOutDate,
    })

    try {
      await Taro.navigateTo({ url: detailUrl })
    } catch {
      Taro.showToast({ title: '页面打开失败', icon: 'none' })
    }
  }

  const handleRoomFieldFocus = () => {
    setActiveField('room')
    setRoomProfileIndex((previousIndex) => (previousIndex + 1) % ROOM_PROFILES.length)
  }

  const checkOutStartDate = useMemo(() => addDays(checkInDate, 1), [checkInDate])

  return (
    <View className='query-page'>
      <ScrollView className='query-scroll safe-bottom' scrollY>
        <View className='query-main'>
          <View className='query-bg-blob query-bg-blob--warm' />
          <View className='query-bg-blob query-bg-blob--cold' />

          <BannerCarousel
            items={MARKETING_BANNERS}
            onActionClick={(bannerItem) => {
              void openBannerTarget(bannerItem.hotelId)
            }}
          />

          <SearchFormCard
            scenes={SCENE_OPTIONS}
            activeScene={activeScene}
            onSceneChange={(nextScene) => {
              setActiveField('scene')
              setActiveScene(nextScene as (typeof SCENE_OPTIONS)[number])
            }}
            cityOptions={CITY_OPTIONS}
            cityValue={cityValue}
            onCityChange={setCityValue}
            keyword={keyword}
            onKeywordChange={setKeyword}
            onKeywordConfirm={() => void handleSearch()}
            locating={isLocating}
            onLocate={() => {
              void handleLocate()
            }}
            today={today}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            checkOutStartDate={checkOutStartDate}
            onCheckInChange={(nextDate) => {
              setActiveField('date')
              updateDateRange(nextDate, checkOutDate)
            }}
            onCheckOutChange={(nextDate) => {
              setActiveField('date')
              updateDateRange(checkInDate, nextDate)
            }}
            checkInText={checkInText}
            checkOutText={checkOutText}
            stayNights={stayNights}
            roomSummary={roomSummary}
            filterSummary={filterSummary}
            activeField={activeField}
            onFieldFocus={(field) => {
              if (field === 'room') {
                handleRoomFieldFocus()
                return
              }

              setActiveField(field)
            }}
            searching={isSearching}
            queryPressing={queryPressing}
            onQueryPressingChange={setQueryPressing}
            onSearch={() => {
              void handleSearch()
            }}
            onFilterEntryClick={async () => {
              try {
                await Taro.navigateTo({ url: '/pages/filter/index?source=query-home' })
              } catch {
                Taro.showToast({ title: '筛选页加载失败', icon: 'none' })
              }
            }}
          />

          {deferredModulesReady ? (
            <Suspense fallback={<View className='query-deferred-skeleton query-deferred-skeleton--panel' />}>
              <DeferredOperationPanel
                coupon={COUPON_CONTENT}
                quickEntries={QUICK_ENTRIES}
                onCouponClick={() => Taro.showToast({ title: '优惠券已发放到账户', icon: 'none' })}
                onQuickEntryClick={(entryItem) => Taro.showToast({ title: `${entryItem.title}建设中`, icon: 'none' })}
              />
            </Suspense>
          ) : (
            <View className='query-deferred-skeleton query-deferred-skeleton--panel' />
          )}
        </View>
      </ScrollView>

      {deferredModulesReady ? (
        <Suspense fallback={<View className='query-bottom-nav-skeleton' />}>
          <DeferredBottomNav
            tabs={BOTTOM_NAV_ITEMS}
            activeTab={bottomNav}
            onTabChange={(tab) => {
              setBottomNav(tab as (typeof BOTTOM_NAV_ITEMS)[number])
              Taro.showToast({ title: `${tab}频道`, icon: 'none' })
            }}
          />
        </Suspense>
      ) : (
        <View className='query-bottom-nav-skeleton' />
      )}
    </View>
  )
}
