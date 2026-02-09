import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Picker, Image } from '@tarojs/components'
import { AtButton, AtSearchBar, AtIcon } from 'taro-ui'
import { useMemo, useState } from 'react'
import { hotelCards } from './mock'
import './style.less'

const SCENE_TABS = ['国内', '海外', '钟点房', '民宿'] as const

const PROMO_BLOCKS = [
  { title: '口碑榜', subTitle: '城市精选', color: 'orange' },
  { title: '附近热卖', subTitle: '2公里内', color: 'red' },
  { title: '超值低价', subTitle: '7折起', color: 'blue' },
] as const

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
  const [locationName, setLocationName] = useState('定位中...')
  const [isLocating, setIsLocating] = useState(false)
  const [checkInDate, setCheckInDate] = useState(today)
  const [checkOutDate, setCheckOutDate] = useState(addDays(today, 1))

  const displayHotels = useMemo(() => {
    return hotelCards.filter((hotel) => {
      const matchKeyword =
        keyword.trim() === '' ||
        hotel.name.includes(keyword) ||
        hotel.address.includes(keyword) ||
        hotel.tags.some((tag) => tag.includes(keyword))

      return matchKeyword
    })
  }, [keyword])

  const handleLocate = async () => {
    if (isLocating) {
      return
    }

    setIsLocating(true)
    try {
      const location = await Taro.getLocation({ type: 'gcj02' })
      const latitude = Number(location.latitude).toFixed(4)
      const longitude = Number(location.longitude).toFixed(4)
      setLocationName(`已定位 (${latitude}, ${longitude})`)
      Taro.showToast({ title: '定位成功', icon: 'success' })
    } catch (error) {
      setLocationName('定位失败，请手动输入城市')
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

  const handleSearch = () => {
    const queryString = [
      `scene=${encodeURIComponent(activeScene)}`,
      `keyword=${encodeURIComponent(keyword)}`,
      `location=${encodeURIComponent(locationName)}`,
      `checkIn=${encodeURIComponent(checkInDate)}`,
      `checkOut=${encodeURIComponent(checkOutDate)}`,
    ].join('&')

    Taro.navigateTo({
      url: `/pages/list/index?${queryString}`,
    })
  }

  return (
    <View className='query-page'>
      <ScrollView className='query-scroll' scrollY>
        <View className='banner-card' onClick={() => openHotelDetail(hotelCards[1].id)}>
          <Text className='banner-badge'>限时热促 · 家庭出游</Text>
          <Text className='banner-title'>{hotelCards[1].name}</Text>
          <Text className='banner-desc'>亲子酒店 7 折起，点击直达详情页</Text>
          <View className='banner-bottom'>
            <Text className='banner-price'>¥{hotelCards[1].price} 起/晚</Text>
            <View className='banner-cta'>
              <Text className='banner-cta-text'>立即查看</Text>
              <AtIcon value='chevron-right' size='14' color='#1d4ed8' />
            </View>
          </View>
        </View>

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
            <AtButton className='locate-btn' size='small' loading={isLocating} onClick={handleLocate}>
              {isLocating ? '定位中' : '定位'}
            </AtButton>
          </View>

          <View className='keyword-block'>
            <AtSearchBar
              value={keyword}
              placeholder='位置/品牌/酒店'
              onChange={(value) => setKeyword(value)}
              showActionButton={false}
              inputType='text'
              className='search-bar'
            />
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
              <AtIcon value='chevron-right' size='12' color='#2563eb' />
            </View>
          </View>

          <AtButton className='query-btn' type='primary' onClick={handleSearch}>
            查 询
          </AtButton>
        </View>

        <View className='promo-grid'>
          {PROMO_BLOCKS.map((item) => (
            <View key={item.title} className={`promo-item ${item.color}`}>
              <Text className='promo-title'>{item.title}</Text>
              <Text className='promo-subtitle'>{item.subTitle}</Text>
            </View>
          ))}
        </View>

        <View className='preview-list'>
          {displayHotels.slice(0, 2).map((hotel) => (
            <View key={hotel.id} className='hotel-card' onClick={() => openHotelDetail(hotel.id)}>
              <Image className='hotel-cover' mode='aspectFill' src={hotel.coverImage} lazyLoad />
              <View className='hotel-content'>
                <Text className='hotel-name'>{hotel.name}</Text>
                <Text className='hotel-intro'>{hotel.intro}</Text>
                <View className='hotel-bottom'>
                  <Text className='hotel-price'>¥{hotel.price} 起</Text>
                  <Text className='hotel-link'>查看详情</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
