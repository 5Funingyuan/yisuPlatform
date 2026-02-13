import { hotelCards } from '../query/mock'
import type { HotelCard } from '../query/types'
import {
  FILTER_TAG_OPTIONS as SHARED_FILTER_TAG_OPTIONS,
  PRICE_OPTIONS as SHARED_PRICE_OPTIONS,
  SCENE_OPTIONS as SHARED_SCENE_OPTIONS,
  STAR_OPTIONS as SHARED_STAR_OPTIONS,
} from '../../shared/search-options'

export const SCENE_OPTIONS = SHARED_SCENE_OPTIONS
export const STAR_OPTIONS = SHARED_STAR_OPTIONS
export const PRICE_OPTIONS = SHARED_PRICE_OPTIONS
export const SORT_OPTIONS = ['欢迎度排序', '位置距离', '低价优先', '评分优先'] as const
export const FILTER_TAG_OPTIONS = Array.from(
  new Set(['近古城', '含早餐', '免费取消', '海景', ...SHARED_FILTER_TAG_OPTIONS]),
) as string[]

const CITY_BUCKET = ['大理市', '大理市', '大理市', '上海市', '深圳市', '杭州市', '三亚市'] as const
const LOCATION_ZONE_BUCKET = ['大理古城', '双廊', '洱海西路', '才村码头', '下关城区', '苍山脚下'] as const
const DISTANCE_BUCKET = ['近洱海公园', '近古城门', '近双廊古镇', '近大理大学', '近崇圣寺三塔'] as const
const BREAKFAST_BUCKET = ['含双早', '含单早', '不含早餐'] as const
const BRANCH_SUFFIX = ['商务店', '甄选店', '轻奢店', '假日店'] as const
const ROOM_TYPE_BUCKET = ['双床房', '大床房'] as const
const BONUS_BUCKET = ['返10倍积分', '返5倍积分', '返30元红包', '返20元红包'] as const
const SPECIAL_DESC_BUCKET = [
  '推窗见洱海，顶楼星空吧观洱海日落',
  '临近美食街，天竺之城景树设计感强',
  '俯视整个大理海岸线，静享私密度假时光',
  '步行可达古城核心，夜游归来更方便',
  '靠近网红打卡点，亲子出行高性价比',
] as const

export interface HotelListItem extends HotelCard {
  itemId: string
  hotelId: string
  city: string
  locationZone: string
  rating: number
  reviewCount: number
  collectCount: number
  soldCount: number
  distance: string
  roomType: string
  breakfast: string
  freeCancel: boolean
  bonusTag: string
  specialDesc: string
  originalPrice: number
}

const uniqueTags = (tags: string[]) => Array.from(new Set(tags.filter(Boolean)))

const replaceAddressCity = (address: string, city: string) => {
  const cityIndex = address.indexOf('市')

  if (cityIndex === -1) {
    return `${city} ${address}`
  }

  return `${city}${address.slice(cityIndex + 1)}`
}

const buildHotelListItem = (baseHotel: HotelCard, itemIndex: number): HotelListItem => {
  const variantIndex = Math.floor(itemIndex / hotelCards.length)
  const city = CITY_BUCKET[itemIndex % CITY_BUCKET.length]
  const locationZone = LOCATION_ZONE_BUCKET[itemIndex % LOCATION_ZONE_BUCKET.length]
  const priceOffset = ((itemIndex % 9) - 4) * 24
  const reviewCount = 320 + itemIndex * 47
  const collectCount = 680 + itemIndex * 83
  const soldCount = 50 + itemIndex * 8
  const rating = Number((4.1 + (itemIndex % 9) * 0.1).toFixed(1))
  const freeCancel = itemIndex % 4 !== 0
  const breakfast = BREAKFAST_BUCKET[(itemIndex + 2) % BREAKFAST_BUCKET.length]
  const roomType = ROOM_TYPE_BUCKET[itemIndex % ROOM_TYPE_BUCKET.length]
  const bonusTag = BONUS_BUCKET[itemIndex % BONUS_BUCKET.length]
  const specialDesc = SPECIAL_DESC_BUCKET[itemIndex % SPECIAL_DESC_BUCKET.length]
  const normalizedPrice = Math.max(188, baseHotel.price + priceOffset)
  const originalPrice = normalizedPrice + 120 + (itemIndex % 6) * 36

  const normalizedBaseTags = baseHotel.tags.map((tag) => (tag === '免费停车' ? '免费停车场' : tag))

  const tags = uniqueTags([
    ...normalizedBaseTags,
    itemIndex % 3 === 0 ? '近地铁' : '',
    itemIndex % 5 === 0 ? '健身房' : '',
    roomType,
    freeCancel ? '免费取消' : '',
    breakfast !== '不含早餐' ? '含早餐' : '',
    locationZone.includes('古城') ? '近古城' : '',
  ])

  const normalizedName =
    variantIndex === 0
      ? baseHotel.name
      : `${baseHotel.name.replace(/（.*?）/g, '')}·${city}${BRANCH_SUFFIX[itemIndex % BRANCH_SUFFIX.length]}`

  return {
    ...baseHotel,
    itemId: `${baseHotel.id}-${itemIndex}`,
    hotelId: baseHotel.id,
    name: normalizedName,
    city,
    address: `${replaceAddressCity(baseHotel.address, city)} · ${locationZone}`,
    tags,
    price: normalizedPrice,
    rating,
    reviewCount,
    collectCount,
    soldCount,
    distance: `${DISTANCE_BUCKET[(itemIndex + 1) % DISTANCE_BUCKET.length]} · ${locationZone}`,
    roomType,
    breakfast,
    freeCancel,
    bonusTag,
    specialDesc,
    locationZone,
    originalPrice,
  }
}

export const HOTEL_LIST_POOL: HotelListItem[] = Array.from({ length: 60 }, (_, index) => {
  const baseHotel = hotelCards[index % hotelCards.length]
  return buildHotelListItem(baseHotel, index)
})
