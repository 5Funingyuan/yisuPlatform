import type { PriceOption, SceneOption, StarOption } from '../shared/search-options'
import type { HotelListItem } from '../pages/list/mock'

export const HOTEL_SORT_OPTIONS = ['recommend', 'distance', 'price', 'score'] as const
export type HotelSortType = (typeof HOTEL_SORT_OPTIONS)[number]

export const HOTEL_SORT_LABELS: Record<HotelSortType, string> = {
  recommend: '推荐排序',
  distance: '位置距离',
  price: '低价优先',
  score: '评分优先',
}

export interface HotelListQuery {
  scene: SceneOption
  city: string
  keyword: string
  checkInDate: string
  checkOutDate: string
  selectedStar: StarOption
  selectedPrice: PriceOption
  selectedTags: string[]
  selectedQuickFilters: string[]
  sortType: HotelSortType
  pageNo: number
  pageSize: number
}

export interface HotelListPageResult {
  list: HotelListItem[]
  total: number
  pageNo: number
  pageSize: number
  hasMore: boolean
}

let hotelListPoolPromise: Promise<HotelListItem[]> | null = null

const loadHotelListPool = async () => {
  if (!hotelListPoolPromise) {
    hotelListPoolPromise = import('../pages/list/mock').then((module) => module.HOTEL_LIST_POOL)
  }

  return hotelListPoolPromise
}

const BASE_QUICK_FILTERS = ['含早餐', '免费取消', '高评分', '低价优先'] as const
const DISTANCE_KEYWORDS = [
  '近地铁 1 号线',
  '近地铁 2 号线',
  '近外滩',
  '近国家会展中心',
  '近迪士尼接驳点',
  '近豫园商圈',
  '近国贸商圈',
  '近天安门',
  '近鸟巢',
  '近雍和宫',
  '近深圳湾公园',
  '近会展中心',
  '近科技园',
  '近口岸通关点',
  '近西湖',
  '近龙翔桥地铁站',
  '近钱塘江',
  '近湖滨步行街',
  '近黄龙商圈',
  '近春熙路',
  '近宽窄巷子',
  '近天府广场',
  '近锦里',
  '近海边步道',
  '近免税店',
  '近海昌梦幻城',
  '近机场快线',
  '近椰梦长廊',
  '近古城门',
  '近洱海公园',
  '近双廊古镇',
  '近大理大学',
  '近崇圣寺三塔',
] as const

const CITY_LOCAL_QUICK_FILTERS: Record<string, string> = {
  上海: '近外滩',
  北京: '近国贸商圈',
  深圳: '近会展中心',
  杭州: '近西湖',
  成都: '近春熙路',
  三亚: '近海边步道',
  大理: '近古城',
}

export const buildQuickFilterOptions = (city: string) => {
  const normalizedCity = city.trim().replace(/市$/, '')
  const localTag = CITY_LOCAL_QUICK_FILTERS[normalizedCity] || '热门地段'
  return [localTag, ...BASE_QUICK_FILTERS]
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

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

const normalizeCityName = (city: string) => {
  const normalizedCity = city.trim()
  if (!normalizedCity) {
    return ''
  }

  if (normalizedCity === '全国' || normalizedCity.startsWith('已定位')) {
    return normalizedCity
  }

  return normalizedCity.endsWith('市') ? normalizedCity : `${normalizedCity}市`
}

const isPriceMatched = (priceValue: number, selectedPrice: PriceOption) => {
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

  if (quickFilter === '含早餐') {
    return hotel.breakfast.includes('含')
  }

  if (quickFilter === '免费取消') {
    return hotel.freeCancel
  }

  if (quickFilter === '高评分') {
    return hotel.rating >= 4.7
  }

  if (quickFilter === '低价优先') {
    return hotel.price <= 360
  }

  return (
    hotel.tags.includes(quickFilter) ||
    hotel.specialDesc.includes(quickFilter) ||
    hotel.distance.includes(quickFilter) ||
    hotel.locationZone.includes(quickFilter)
  )
}

const getRecommendScore = (hotel: HotelListItem, scene: SceneOption) => {
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

const sortHotelList = (left: HotelListItem, right: HotelListItem, sortType: HotelSortType, scene: SceneOption) => {
  if (sortType === 'distance') {
    return parseDistanceToMeter(left.distance) - parseDistanceToMeter(right.distance) || right.rating - left.rating
  }

  if (sortType === 'price') {
    return left.price - right.price || right.rating - left.rating
  }

  if (sortType === 'score') {
    return right.rating - left.rating || right.reviewCount - left.reviewCount
  }

  return getRecommendScore(right, scene) - getRecommendScore(left, scene)
}

const isKeywordMatched = (hotel: HotelListItem, normalizedKeyword: string) => {
  if (!normalizedKeyword) {
    return true
  }

  return (
    hotel.name.toLowerCase().includes(normalizedKeyword) ||
    hotel.address.toLowerCase().includes(normalizedKeyword) ||
    hotel.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword)) ||
    hotel.specialDesc.toLowerCase().includes(normalizedKeyword)
  )
}

const isCityMatched = (hotel: HotelListItem, city: string) => {
  const normalizedCity = normalizeCityName(city)
  const normalizedCityKeyword = normalizedCity.replace(/市$/, '')

  if (!normalizedCityKeyword || normalizedCity === '全国' || normalizedCity.startsWith('已定位')) {
    return true
  }

  return normalizeCityName(hotel.city) === normalizedCity
}

export const fetchHotelListPage = async (query: HotelListQuery): Promise<HotelListPageResult> => {
  const rawKeyword = query.keyword.trim()
  const normalizedKeyword = rawKeyword === '不限' ? '' : rawKeyword.toLowerCase()

  if (normalizedKeyword.includes('error') || normalizedKeyword.includes('错误')) {
    await sleep(420)
    throw new Error('模拟网络错误，请点击重试')
  }

  await sleep(380 + Math.round(Math.random() * 240))
  const hotelListPool = await loadHotelListPool()

  const filteredList = hotelListPool.filter((hotel) => {
    if (!isCityMatched(hotel, query.city)) {
      return false
    }

    if (!isKeywordMatched(hotel, normalizedKeyword)) {
      return false
    }

    if (query.selectedStar !== '不限' && hotel.star !== query.selectedStar) {
      return false
    }

    if (!isPriceMatched(hotel.price, query.selectedPrice)) {
      return false
    }

    if (query.selectedTags.length > 0) {
      const allTagsMatched = query.selectedTags.every((tag) => hotel.tags.includes(tag))
      if (!allTagsMatched) {
        return false
      }
    }

    if (query.selectedQuickFilters.length > 0) {
      const allQuickFiltersMatched = query.selectedQuickFilters.every((quickFilter) =>
        isQuickFilterMatched(hotel, quickFilter),
      )
      if (!allQuickFiltersMatched) {
        return false
      }
    }

    return true
  }).sort((left, right) => sortHotelList(left, right, query.sortType, query.scene))

  const safePageNo = Math.max(1, query.pageNo)
  const safePageSize = Math.max(1, query.pageSize)
  const startIndex = (safePageNo - 1) * safePageSize
  const endIndex = startIndex + safePageSize
  const list = filteredList.slice(startIndex, endIndex)

  return {
    list,
    total: filteredList.length,
    pageNo: safePageNo,
    pageSize: safePageSize,
    hasMore: endIndex < filteredList.length,
  }
}
