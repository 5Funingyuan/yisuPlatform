import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Picker, Image, Swiper, SwiperItem, Input } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { useState } from 'react'
import { hotelCards } from './mock'
import './style.less'

const SCENE_TABS = ['国内', '海外', '钟点房', '民宿'] as const

const PROMO_BLOCKS = [
  { title: '口碑榜', subTitle: '城市精选', color: 'orange' },
  { title: '附近热卖', subTitle: '2公里内', color: 'red' },
  { title: '超值低价', subTitle: '7折起', color: 'blue' },
] as const

const QUICK_FILTER_TAGS = ['亲子', '豪华', '免费停车场', '含早餐', '可取消', '近地铁'] as const
const QUICK_TAG_PREVIEW_COUNT = 3

const formatToYmd = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseYmd = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const addDays = (dateValue: string, days: number) => {
  const date = parseYmd(dateValue)
  date.setDate(date.getDate() + days)
  return formatToYmd(date)
}

const getToday = () => formatToYmd(new Date())

export default function QueryPage() {
  const today = getToday()
  const [activeScene, setActiveScene] = useState<(typeof SCENE_TABS)[number]>('国内')
  const [keyword, setKeyword] = useState('深圳会展中心')
  const [locationName, setLocationName] = useState('上海')
  const [isLocating, setIsLocating] = useState(false)
  const [showAllQuickTags, setShowAllQuickTags] = useState(false)
  const [checkInDate, setCheckInDate] = useState(today)
  const [checkOutDate, setCheckOutDate] = useState(addDays(today, 1))

  const bannerHotels = hotelCards.slice(0, 3)
  const visibleQuickTags = showAllQuickTags ? QUICK_FILTER_TAGS : QUICK_FILTER_TAGS.slice(0, QUICK_TAG_PREVIEW_COUNT)
  const canExpandQuickTags = QUICK_FILTER_TAGS.length > QUICK_TAG_PREVIEW_COUNT

  const handleLocate = async () => {
    if (isLocating) {
      return
    }

    setIsLocating(true)
    try {
      const location = await Taro.getLocation({ type: 'gcj02' })
      const latitude = Number(location.latitude).toFixed(4)
      const longitude = Number(location.longitude).toFixed(4)
      setLocationName(`已定位 ${latitude},${longitude}`)
      Taro.showToast({ title: '定位成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '定位失败，请检查授权', icon: 'none' })
    } finally {
      setIsLocating(false)
    }
  }

  const openFilterPage = () => {
    Taro.navigateTo({
      url: '/pages/filter/index',
    })
  }

  const getNightsText = () => {
    const inDate = parseYmd(checkInDate)
    const outDate = parseYmd(checkOutDate)
    const diff = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (24 * 60 * 60 * 1000)))
    return `${diff}晚`
  }

  const formatDate = (dateText: string) => dateText.slice(5).replace('-', '月') + '日'

  const openHotelDetail = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleCheckInDateChange = (event: { detail: { value: string } }) => {
    const nextCheckIn = event.detail.value
    setCheckInDate(nextCheckIn)

    if (nextCheckIn >= checkOutDate) {
      setCheckOutDate(addDays(nextCheckIn, 1))
    }
  }

  const handleCheckOutDateChange = (event: { detail: { value: string } }) => {
    const nextCheckOut = event.detail.value
    if (nextCheckOut <= checkInDate) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      return
    }
    setCheckOutDate(nextCheckOut)
  }

  const handleSearch = (nextKeyword = keyword) => {
    const queryString = [
      `scene=${encodeURIComponent(activeScene)}`,
      `keyword=${encodeURIComponent(nextKeyword)}`,
      `location=${encodeURIComponent(locationName)}`,
      `checkIn=${encodeURIComponent(checkInDate)}`,
      `checkOut=${encodeURIComponent(checkOutDate)}`,
    ].join('&')

    Taro.navigateTo({
      url: `/pages/list/index?${queryString}`,
    })
  }

  const handleKeywordInput = (event: { detail: { value: string } }) => {
    setKeyword(event.detail.value)
  }

  const handleKeywordConfirm = (event?: { detail: { value: string } }) => {
    const nextKeyword = event?.detail?.value ?? keyword
    setKeyword(nextKeyword)
    handleSearch(nextKeyword)
  }

  return (
    <View className='query-page'>
      <ScrollView className='query-scroll' scrollY>
        <Swiper
          className='banner-swiper'
          circular
          autoplay
          interval={3200}
          duration={500}
          indicatorDots
          indicatorColor='rgba(255,255,255,0.45)'
          indicatorActiveColor='#ffffff'
        >
          {bannerHotels.map((hotel) => (
            <SwiperItem key={hotel.id}>
              <View className='banner-card' onClick={() => openHotelDetail(hotel.id)}>
                <Image className='banner-bg' mode='aspectFill' src={hotel.coverImage} lazyLoad />
                <View className='banner-mask' />

                <View className='banner-content'>
                  <View className='banner-tags'>
                    {[hotel.star, ...hotel.tags.slice(0, 2)].map((tag) => (
                      <Text key={tag} className='banner-pill'>
                        {tag}
                      </Text>
                    ))}
                  </View>
                  <Text className='banner-title'>{hotel.name}</Text>
                  <Text className='banner-desc'>{hotel.promo}</Text>
                  <View className='banner-bottom'>
                    <Text className='banner-price'>¥{hotel.price} 起/晚</Text>
                    <View className='banner-cta'>
                      <Text className='banner-cta-text'>立即查看</Text>
                      <AtIcon value='chevron-right' size='14' color='#1d4ed8' />
                    </View>
                  </View>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>

        <View className='search-card'>
          <View className='scene-tabs'>
            {SCENE_TABS.map((tab) => (
              <View
                key={tab}
                className={`scene-tab ${activeScene === tab ? 'active' : ''}`}
                onClick={() => setActiveScene(tab)}
              >
                <Text>{tab}</Text>
              </View>
            ))}
          </View>

          <View className='location-tip'>
            <AtIcon value='map-pin' size='14' color='#2563eb' />
            <Text className='location-tip-text'>已定位到 {locationName}</Text>
          </View>

          <View className='base-row'>
            <View className='position-block'>
              <Text className='position-title'>我的位置</Text>
              <Text className='position-value'>{locationName}</Text>
            </View>

            <View className='search-action-area'>
              <View className='inline-search'>
                <AtIcon value='search' size='15' color='#94a3b8' />
                <Input
                  className='inline-search-input'
                  value={keyword}
                  placeholder='位置/品牌/酒店'
                  placeholderClass='inline-search-placeholder'
                  confirmType='search'
                  onInput={handleKeywordInput}
                  onConfirm={handleKeywordConfirm}
                />
              </View>

              <View className={`locate-action-btn ${isLocating ? 'is-loading' : ''}`} onClick={handleLocate}>
                <AtIcon value='map-pin' size='14' color='#2563eb' />
              </View>
            </View>
          </View>

          <View className='date-row'>
            <Picker mode='date' value={checkInDate} start={today} onChange={handleCheckInDateChange}>
              <View className='date-item'>
                <Text className='date-title'>{formatDate(checkInDate)}</Text>
                <Text className='date-desc'>今天入住</Text>
              </View>
            </Picker>
            <View className='date-separator'>-</View>
            <Picker mode='date' value={checkOutDate} start={addDays(checkInDate, 1)} onChange={handleCheckOutDateChange}>
              <View className='date-item date-item-right'>
                <Text className='date-title'>{formatDate(checkOutDate)}</Text>
                <Text className='date-desc'>明天离店</Text>
              </View>
            </Picker>
            <Text className='night-count'>共{getNightsText()}</Text>
          </View>

          <View className='capacity-row'>
            <Text className='capacity-text'>1间房 1成人 0儿童</Text>
            <View className='capacity-filter-btn' onClick={openFilterPage}>
              <Text className='capacity-filter'>价格/星级</Text>
              <AtIcon value='chevron-right' size='12' color='#334155' />
            </View>
          </View>

          <View className={`quick-tags-wrap ${showAllQuickTags ? 'is-expanded' : ''}`}>
            <View className='quick-tags'>
              {visibleQuickTags.map((tag) => (
                <View key={tag} className='quick-tag-item'>
                  <Text>{tag}</Text>
                </View>
              ))}

              {showAllQuickTags && canExpandQuickTags ? (
                <View
                  className='quick-tag-toggle quick-tag-toggle-inline'
                  onClick={() => setShowAllQuickTags((prev) => !prev)}
                >
                  <Text>收起</Text>
                  <AtIcon value='chevron-up' size='11' color='#334155' />
                </View>
              ) : null}
            </View>

            {!showAllQuickTags && canExpandQuickTags ? (
              <View className='quick-tag-toggle-mask' onClick={() => setShowAllQuickTags(true)}>
                <View className='quick-tag-toggle'>
                  <Text>更多</Text>
                  <AtIcon value='chevron-down' size='11' color='#334155' />
                </View>
              </View>
            ) : null}
          </View>

          <View className='query-btn' onClick={() => handleSearch()}>
            <Text>查询</Text>
          </View>
        </View>

        <View className='promo-grid'>
          {PROMO_BLOCKS.map((item) => (
            <View key={item.title} className={`promo-item ${item.color}`}>
              <Text className='promo-title'>{item.title}</Text>
              <Text className='promo-subtitle'>{item.subTitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
