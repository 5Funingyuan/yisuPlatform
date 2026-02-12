import { View, Text, Image, Swiper, SwiperItem, Picker, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import LiteIcon from '../../components/lite-icon'
import {
  addDays,
  getSyncedDateRange,
  getStayNights,
  getToday,
  isDateRangeValid,
  normalizeDateRange,
  normalizeYmd,
  parseYmd,
  syncDateRangeState,
} from '../../shared/date'
import { safeDecode } from '../../shared/route'
import {
  QUERY_PAGE_PATH,
  buildListUrl,
  pickSearchContextFromParams,
} from '../../shared/search-context'
import { getHotelDetailById } from './mock'
import './style.less'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

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

export default function HotelDetailPage() {
  const router = useRouter()
  const params = router.params || {}
  const source = safeDecode(params.source)
  const hotelId = safeDecode(params.id)
  const hotel = useMemo(() => getHotelDetailById(hotelId), [hotelId])

  const [today, setToday] = useState(() => getToday())
  const initialCheckInDate = normalizeYmd(safeDecode(params.checkIn), today)
  const initialCheckOutCandidate = normalizeYmd(safeDecode(params.checkOut), addDays(initialCheckInDate, 1))
  const initialDateRange = normalizeDateRange(initialCheckInDate, initialCheckOutCandidate, today)

  const [checkInDate, setCheckInDate] = useState(initialDateRange.checkInDate)
  const [checkOutDate, setCheckOutDate] = useState(initialDateRange.checkOutDate)
  const [bannerIndex, setBannerIndex] = useState(0)
  const [isRouting, setIsRouting] = useState(false)

  const sortedRoomRatePlans = useMemo(() => {
    return hotel.roomRatePlans
      .map((item, index) => ({ item, index }))
      .sort((left, right) => left.item.merchantPrice - right.item.merchantPrice || left.index - right.index)
      .map((entry) => entry.item)
  }, [hotel.roomRatePlans])

  const listContext = useMemo(
    () => pickSearchContextFromParams(params),
    [params.keyword, params.location, params.price, params.scene, params.star, params.tags],
  )

  const stayNights = getStayNights(checkInDate, checkOutDate)

  const syncDateRangeWithToday = () =>
    syncDateRangeState(
      { today, checkInDate, checkOutDate },
      { setToday, setCheckInDate, setCheckOutDate },
    )

  const resolveListUrl = (nextCheckInDate: string, nextCheckOutDate: string) => {
    return buildListUrl({
      ...listContext,
      checkIn: nextCheckInDate,
      checkOut: nextCheckOutDate,
      source: 'detail',
    })
  }

  const safeNavigate = async (routeAction: () => Promise<unknown>) => {
    if (isRouting) {
      return
    }

    setIsRouting(true)

    try {
      await routeAction()
    } catch {
      Taro.showToast({ title: '页面跳转失败，请稍后重试', icon: 'none' })
    } finally {
      setIsRouting(false)
    }
  }

  const handleGoBack = async () => {
    const normalizedRange = syncDateRangeWithToday()
    const pages = Taro.getCurrentPages()

    if (pages.length > 1) {
      await safeNavigate(async () => {
        await Taro.navigateBack()
      })
      return
    }

    const hasListContext = Object.keys(listContext).length > 0

    if (source === 'list' || hasListContext) {
      await safeNavigate(async () => {
        await Taro.reLaunch({
          url: resolveListUrl(normalizedRange.checkInDate, normalizedRange.checkOutDate),
        })
      })
      return
    }

    await safeNavigate(async () => {
      await Taro.reLaunch({ url: QUERY_PAGE_PATH })
    })
  }

  const handleCheckInChange = (event: { detail: { value: string } }) => {
    const latestToday = getSyncedDateRange(checkInDate, checkOutDate).today

    const nextCheckIn = normalizeYmd(event.detail.value, latestToday)
    const normalizedRange = normalizeDateRange(nextCheckIn, checkOutDate, latestToday)
    setCheckInDate(normalizedRange.checkInDate)
    setCheckOutDate(normalizedRange.checkOutDate)
  }

  const handleCheckOutChange = (event: { detail: { value: string } }) => {
    const normalizedRange = syncDateRangeWithToday()
    const fallbackCheckOut = addDays(normalizedRange.checkInDate, 1)
    const nextCheckOut = normalizeYmd(event.detail.value, fallbackCheckOut)

    if (nextCheckOut === checkOutDate) {
      return
    }

    if (!isDateRangeValid(normalizedRange.checkInDate, nextCheckOut)) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      setCheckOutDate(fallbackCheckOut)
      return
    }

    setCheckOutDate(nextCheckOut)
  }

  const handleBookRoom = (roomName: string, isSoldOut: boolean) => {
    if (isSoldOut) {
      Taro.showToast({ title: '该房型已满房', icon: 'none' })
      return
    }

    Taro.showToast({ title: `已选择${roomName}`, icon: 'none' })
  }

  return (
    <View className='detail-page'>
      <View className='detail-nav'>
        <View className={`nav-back ${isRouting ? 'is-loading' : ''}`} onClick={() => void handleGoBack()}>
          <LiteIcon value='chevron-left' size='16' color='#0f172a' />
          <Text className='nav-back-text'>返回上一页</Text>
        </View>
        <Text className='nav-title'>{hotel.name}</Text>
      </View>

      <ScrollView className='detail-scroll' scrollY>
        <View className='detail-content'>
          <View className='banner-wrap'>
            <Swiper
              className='detail-banner'
              circular
              indicatorDots
              autoplay
              interval={3600}
              duration={500}
              indicatorColor='rgba(255,255,255,0.45)'
              indicatorActiveColor='#ffffff'
              onChange={(event) => setBannerIndex(event.detail.current)}
            >
              {hotel.gallery.map((imageUrl, index) => (
                <SwiperItem key={`${hotel.id}-${index}`}>
                  <View className='banner-item'>
                    <Image className='banner-image' mode='aspectFill' src={imageUrl} lazyLoad />
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
            <Text className='banner-count'>
              {bannerIndex + 1}/{hotel.gallery.length}
            </Text>
          </View>

          <View className='section-card'>
            <View className='section-header'>
              <Text className='section-title'>酒店信息</Text>
            </View>

            <Text className='hotel-name'>{hotel.name}</Text>

            <View className='star-row'>
              <LiteIcon value='star-2' size='13' color='#f59e0b' />
              <Text className='star-text'>{hotel.star}</Text>
            </View>

            <View className='facility-list'>
              {hotel.facilities.map((facility) => (
                <Text key={facility} className='facility-tag'>
                  {facility}
                </Text>
              ))}
            </View>

            <View className='address-row'>
              <LiteIcon value='map-pin' size='12' color='#64748b' />
              <Text className='address-text'>{hotel.address}</Text>
            </View>
          </View>

          <View className='section-card'>
            <View className='section-header'>
              <Text className='section-title'>入住离店</Text>
              <Text className='section-tip'>1 间 {stayNights} 晚</Text>
            </View>

            <View className='calendar-banner'>
              <Picker mode='date' value={checkInDate} start={today} onChange={handleCheckInChange}>
                <View className='calendar-item'>
                  <Text className='calendar-label'>入住</Text>
                  <Text className='calendar-date'>{formatDateWithWeek(checkInDate)}</Text>
                </View>
              </Picker>

              <View className='calendar-divider'>
                <LiteIcon value='subtract-circle' size='12' color='#cbd5e1' />
              </View>

              <Picker mode='date' value={checkOutDate} start={addDays(checkInDate, 1)} onChange={handleCheckOutChange}>
                <View className='calendar-item'>
                  <Text className='calendar-label'>离店</Text>
                  <Text className='calendar-date'>{formatDateWithWeek(checkOutDate)}</Text>
                </View>
              </Picker>

              <View className='night-pill'>
                <Text>{`1间${stayNights}晚`}</Text>
              </View>
            </View>
          </View>

          <View className='section-card room-card'>
            <View className='section-header'>
              <Text className='section-title'>房型价格</Text>
              <Text className='section-tip'>商户价从低到高</Text>
            </View>

            <View className='room-list'>
              {sortedRoomRatePlans.map((room) => {
                const isSoldOut = room.stock <= 0

                return (
                  <View key={room.id} className={`room-item ${isSoldOut ? 'is-sold-out' : ''}`}>
                    <View className='room-main'>
                      <Text className='room-name'>{room.roomName}</Text>
                      <View className='room-meta'>
                        <Text>{room.bedType}</Text>
                        <Text>{room.breakfast}</Text>
                      </View>
                      <Text className='room-rule'>{room.cancelRule}</Text>
                    </View>

                    <View className='room-side'>
                      <Text className='room-price-label'>商户价</Text>
                      <Text className='room-price'>¥{room.merchantPrice}</Text>
                      <View
                        className={`book-btn ${isSoldOut ? 'is-disabled' : ''}`}
                        onClick={() => {
                          handleBookRoom(room.roomName, isSoldOut)
                        }}
                      >
                        <Text>{isSoldOut ? '已满房' : '预订'}</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
