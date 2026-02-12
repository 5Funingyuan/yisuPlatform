import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Input } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { useMemo, useState } from 'react'
import { hotelCards } from './mock'
import './style.less'

const SCENE_TABS = ['国内', '海外', '钟点房', '民宿'] as const

const STAR_OPTIONS = ['不限', '经济型', '舒适型', '高档型', '豪华型'] as const
const PRICE_OPTIONS = ['不限', '¥0-200', '¥200-400', '¥400-700', '¥700+'] as const
const FEATURE_TAGS = ['亲子', '豪华', '免费停车场', '含早餐', '免费取消', '近地铁', '可开发票', '健身房'] as const
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'] as const
const CALENDAR_MONTH_COUNT = 2

const PROMO_BLOCKS = [
  { title: '口碑榜', subTitle: '城市精选', color: 'orange' },
  { title: '附近热卖', subTitle: '2公里内', color: 'red' },
  { title: '超值低价', subTitle: '7折起', color: 'blue' },
] as const

interface CalendarCell {
  key: string
  dateValue: string
  day: number
  isPlaceholder: boolean
  isDisabled: boolean
}

interface CalendarMonth {
  key: string
  title: string
  cells: CalendarCell[]
}

const formatToYmd = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseYmd = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

const addDays = (dateValue: string, days: number) => {
  const date = parseYmd(dateValue)
  date.setDate(date.getDate() + days)
  return formatToYmd(date)
}

const getToday = () => formatToYmd(new Date())

const getStayNights = (checkInDate: string, checkOutDate: string) => {
  const diff = Math.floor((parseYmd(checkOutDate).getTime() - parseYmd(checkInDate).getTime()) / (24 * 60 * 60 * 1000))
  return Math.max(1, diff)
}

const formatDate = (dateText: string) => {
  const [, month, day] = dateText.split('-')
  return `${month}月${day}日`
}

const createCalendarMonth = (monthStartDate: Date, minDate: string): CalendarMonth => {
  const year = monthStartDate.getFullYear()
  const month = monthStartDate.getMonth()
  const firstDay = new Date(year, month, 1, 12)
  const dayCount = new Date(year, month + 1, 0, 12).getDate()

  const cells: CalendarCell[] = []

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({
      key: `empty-${year}-${month + 1}-${index}`,
      dateValue: '',
      day: 0,
      isPlaceholder: true,
      isDisabled: true,
    })
  }

  for (let day = 1; day <= dayCount; day += 1) {
    const dateValue = formatToYmd(new Date(year, month, day, 12))
    cells.push({
      key: dateValue,
      dateValue,
      day,
      isPlaceholder: false,
      isDisabled: dateValue < minDate,
    })
  }

  while (cells.length % 7 !== 0) {
    const index = cells.length
    cells.push({
      key: `tail-${year}-${month + 1}-${index}`,
      dateValue: '',
      day: 0,
      isPlaceholder: true,
      isDisabled: true,
    })
  }

  return {
    key: `${year}-${month + 1}`,
    title: `${year}年${month + 1}月`,
    cells,
  }
}

const getCalendarMonths = (startDate: string, monthCount: number) => {
  const baseDate = parseYmd(startDate)
  return Array.from({ length: monthCount }, (_, index) => {
    const monthStartDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1, 12)
    return createCalendarMonth(monthStartDate, startDate)
  })
}

export default function QueryPage() {
  const today = useMemo(() => getToday(), [])
  const [activeScene, setActiveScene] = useState<(typeof SCENE_TABS)[number]>('国内')
  const [keyword, setKeyword] = useState('深圳会展中心')
  const [locationName, setLocationName] = useState('上海')
  const [isLocating, setIsLocating] = useState(false)
  const [selectedStar, setSelectedStar] = useState<(typeof STAR_OPTIONS)[number]>('不限')
  const [selectedPrice, setSelectedPrice] = useState<(typeof PRICE_OPTIONS)[number]>('不限')
  const [selectedTags, setSelectedTags] = useState<string[]>(['亲子', '免费停车场'])

  const [checkInDate, setCheckInDate] = useState(today)
  const [checkOutDate, setCheckOutDate] = useState(addDays(today, 1))
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarStep, setCalendarStep] = useState<'checkIn' | 'checkOut'>('checkIn')
  const [calendarCheckInDate, setCalendarCheckInDate] = useState(today)
  const [calendarCheckOutDate, setCalendarCheckOutDate] = useState(addDays(today, 1))

  const bannerHotels = hotelCards.slice(0, 3)
  const calendarMonths = useMemo(() => getCalendarMonths(today, CALENDAR_MONTH_COUNT), [today])

  const stayNights = getStayNights(checkInDate, checkOutDate)
  const tempStayNights = getStayNights(calendarCheckInDate, calendarCheckOutDate)

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
    } catch {
      Taro.showToast({ title: '定位失败，请检查授权', icon: 'none' })
    } finally {
      setIsLocating(false)
    }
  }

  const openHotelDetail = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const openCalendar = () => {
    setCalendarCheckInDate(checkInDate)
    setCalendarCheckOutDate(checkOutDate)
    setCalendarStep('checkIn')
    setShowCalendar(true)
  }

  const closeCalendar = () => {
    setShowCalendar(false)
  }

  const resetCalendar = () => {
    setCalendarCheckInDate(today)
    setCalendarCheckOutDate(addDays(today, 1))
    setCalendarStep('checkIn')
  }

  const handleCalendarDayClick = (cell: CalendarCell) => {
    if (cell.isPlaceholder || cell.isDisabled) {
      return
    }

    if (calendarStep === 'checkIn') {
      setCalendarCheckInDate(cell.dateValue)

      if (cell.dateValue >= calendarCheckOutDate) {
        setCalendarCheckOutDate(addDays(cell.dateValue, 1))
      }

      setCalendarStep('checkOut')
      return
    }

    if (cell.dateValue <= calendarCheckInDate) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      return
    }

    setCalendarCheckOutDate(cell.dateValue)
  }

  const confirmCalendar = () => {
    setCheckInDate(calendarCheckInDate)
    setCheckOutDate(calendarCheckOutDate)
    setShowCalendar(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag)
      }
      return [...prev, tag]
    })
  }

  const handleSearch = (nextKeyword = keyword) => {
    const normalizedKeyword = nextKeyword.trim() || '不限'
    const queryString = [
      `scene=${encodeURIComponent(activeScene)}`,
      `keyword=${encodeURIComponent(normalizedKeyword)}`,
      `location=${encodeURIComponent(locationName)}`,
      `checkIn=${encodeURIComponent(checkInDate)}`,
      `checkOut=${encodeURIComponent(checkOutDate)}`,
      `star=${encodeURIComponent(selectedStar)}`,
      `price=${encodeURIComponent(selectedPrice)}`,
      `tags=${encodeURIComponent(selectedTags.join(','))}`,
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

  const renderCalendarDay = (cell: CalendarCell) => {
    if (cell.isPlaceholder) {
      return <View key={cell.key} className='calendar-day is-placeholder' />
    }

    const isStart = cell.dateValue === calendarCheckInDate
    const isEnd = cell.dateValue === calendarCheckOutDate
    const isInRange = cell.dateValue >= calendarCheckInDate && cell.dateValue <= calendarCheckOutDate
    const dayClassName = [
      'calendar-day',
      cell.isDisabled ? 'is-disabled' : '',
      isInRange ? 'is-range' : '',
      isStart ? 'is-start' : '',
      isEnd ? 'is-end' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <View key={cell.key} className={dayClassName} onClick={() => handleCalendarDayClick(cell)}>
        <Text className='calendar-day-text'>{cell.day}</Text>
        {isStart || isEnd ? <Text className='calendar-day-tip'>{isStart ? '住' : '离'}</Text> : null}
      </View>
    )
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

          <View className='field-card'>
            <View className='field-header'>
              <View className='field-title-wrap'>
                <AtIcon value='map-pin' size='14' color='#2563eb' />
                <Text className='field-title'>当前地点</Text>
              </View>
              <View className={`location-btn ${isLocating ? 'is-loading' : ''}`} onClick={handleLocate}>
                <Text>{isLocating ? '定位中...' : '重新定位'}</Text>
              </View>
            </View>
            <Text className='location-value'>{locationName}</Text>
          </View>

          <View className='field-card'>
            <View className='field-header'>
              <View className='field-title-wrap'>
                <AtIcon value='search' size='14' color='#2563eb' />
                <Text className='field-title'>关键词搜索</Text>
              </View>
            </View>
            <View className='keyword-input-wrap'>
              <AtIcon value='search' size='14' color='#94a3b8' />
              <Input
                className='keyword-input'
                value={keyword}
                placeholder='位置 / 品牌 / 酒店名'
                placeholderClass='keyword-placeholder'
                confirmType='search'
                onInput={handleKeywordInput}
                onConfirm={handleKeywordConfirm}
              />
            </View>
          </View>

          <View className='field-card' onClick={openCalendar}>
            <View className='field-header'>
              <View className='field-title-wrap'>
                <AtIcon value='calendar' size='14' color='#2563eb' />
                <Text className='field-title'>入住日期</Text>
              </View>
              <Text className='field-tip'>共 {stayNights} 晚</Text>
            </View>
            <View className='date-values'>
              <View className='date-item'>
                <Text className='date-label'>入住</Text>
                <Text className='date-value'>{formatDate(checkInDate)}</Text>
              </View>

              <View className='date-divider' />

              <View className='date-item'>
                <Text className='date-label'>离店</Text>
                <Text className='date-value'>{formatDate(checkOutDate)}</Text>
              </View>

              <View className='night-pill'>
                <Text>{stayNights}晚</Text>
              </View>
            </View>
          </View>

          <View className='field-card'>
            <View className='field-header'>
              <View className='field-title-wrap'>
                <AtIcon value='filter' size='14' color='#2563eb' />
                <Text className='field-title'>筛选条件</Text>
              </View>
              <Text className='field-tip'>支持多维组合筛选</Text>
            </View>

            <Text className='group-title'>酒店星级</Text>
            <View className='chip-row'>
              {STAR_OPTIONS.map((option) => (
                <View
                  key={option}
                  className={`filter-chip ${selectedStar === option ? 'active' : ''}`}
                  onClick={() => setSelectedStar(option)}
                >
                  <Text>{option}</Text>
                </View>
              ))}
            </View>

            <Text className='group-title'>价格区间</Text>
            <View className='chip-row'>
              {PRICE_OPTIONS.map((option) => (
                <View
                  key={option}
                  className={`filter-chip ${selectedPrice === option ? 'active' : ''}`}
                  onClick={() => setSelectedPrice(option)}
                >
                  <Text>{option}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='field-card'>
            <View className='field-header'>
              <View className='field-title-wrap'>
                <AtIcon value='check-circle' size='14' color='#2563eb' />
                <Text className='field-title'>快捷标签</Text>
              </View>
              <Text className='field-tip'>可多选</Text>
            </View>

            <View className='chip-row'>
              {FEATURE_TAGS.map((tag) => (
                <View key={tag} className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`} onClick={() => toggleTag(tag)}>
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='query-btn' onClick={() => handleSearch()}>
            <Text>查询酒店</Text>
            <AtIcon value='chevron-right' size='14' color='#ffffff' />
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

      {showCalendar ? (
        <View className='calendar-mask' onClick={closeCalendar}>
          <View
            className='calendar-panel'
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <View className='calendar-header'>
              <View>
                <Text className='calendar-title'>选择入住日期</Text>
                <Text className='calendar-subtitle'>
                  {calendarStep === 'checkIn' ? '请先选择入住日期' : '请选择离店日期'} · 共 {tempStayNights} 晚
                </Text>
              </View>
              <View className='calendar-close' onClick={closeCalendar}>
                <AtIcon value='close' size='12' color='#64748b' />
              </View>
            </View>

            <View className='calendar-preview'>
              <View className='preview-item'>
                <Text className='preview-label'>入住</Text>
                <Text className='preview-date'>{formatDate(calendarCheckInDate)}</Text>
              </View>
              <View className='preview-item'>
                <Text className='preview-label'>离店</Text>
                <Text className='preview-date'>{formatDate(calendarCheckOutDate)}</Text>
              </View>
            </View>

            <View className='calendar-week-row'>
              {WEEK_DAYS.map((day) => (
                <Text key={day} className='week-item'>
                  {day}
                </Text>
              ))}
            </View>

            <ScrollView className='calendar-months' scrollY>
              {calendarMonths.map((month) => (
                <View key={month.key} className='calendar-month'>
                  <Text className='calendar-month-title'>{month.title}</Text>
                  <View className='calendar-grid'>{month.cells.map((cell) => renderCalendarDay(cell))}</View>
                </View>
              ))}
            </ScrollView>

            <View className='calendar-actions'>
              <View className='calendar-action ghost' onClick={resetCalendar}>
                <Text>重置</Text>
              </View>
              <View className='calendar-action primary' onClick={confirmCalendar}>
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
