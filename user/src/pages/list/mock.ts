import { CITY_HOTEL_LIBRARY } from '../query/mock'
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

const CITY_BUCKET = ['上海市', '北京市', '深圳市', '杭州市', '成都市', '三亚市', '大理市'] as const
const CITY_GENERATION_PLAN: readonly [city: (typeof CITY_BUCKET)[number], count: number][] = [
  ['上海市', 18],
  ['北京市', 17],
  ['深圳市', 17],
  ['杭州市', 17],
  ['成都市', 17],
  ['三亚市', 17],
  ['大理市', 17],
]
const BREAKFAST_BUCKET = ['含双早', '含单早', '不含早餐'] as const
const BRANCH_SUFFIX = ['商务店', '甄选店', '轻奢店', '假日店'] as const
const ROOM_TYPE_BUCKET = ['双床房', '大床房'] as const
const BONUS_BUCKET = ['返10倍积分', '返5倍积分', '返30元红包', '返20元红包'] as const

interface CityProfile {
  zones: readonly string[]
  distances: readonly string[]
  addresses: readonly string[]
  sellingPoints: readonly string[]
}

const CITY_PROFILES: Record<(typeof CITY_BUCKET)[number], CityProfile> = {
  大理市: {
    zones: ['大理古城', '双廊', '洱海西路', '才村码头', '下关城区', '苍山脚下'],
    distances: ['近洱海公园', '近古城门', '近双廊古镇', '近大理大学', '近崇圣寺三塔'],
    addresses: [
      '大理市古城人民路 66 号',
      '大理市双廊镇海街 18 号',
      '大理市洱海门外复兴路 102 号',
      '大理市下关建设路 128 号',
      '大理市苍山大道 75 号',
    ],
    sellingPoints: [
      '推窗见洱海，顶楼星空吧观洱海日落',
      '临近古城美食街，夜游归来更方便',
      '俯视大理海岸线，适合慢节奏度假',
      '步行可达古城核心景点，出游效率高',
      '靠近网红打卡点，亲子出行高性价比',
    ],
  },
  上海市: {
    zones: ['人民广场', '南京西路', '陆家嘴', '徐家汇', '静安寺', '虹桥枢纽'],
    distances: ['近地铁 2 号线', '近外滩', '近国家会展中心', '近迪士尼接驳点', '近豫园商圈'],
    addresses: [
      '上海市黄浦区南京东路 188 号',
      '上海市浦东新区陆家嘴环路 1000 号',
      '上海市静安区南京西路 1266 号',
      '上海市徐汇区虹桥路 333 号',
      '上海市闵行区申长路 988 号',
    ],
    sellingPoints: [
      '步行可达地铁站，通勤与游玩都方便',
      '核心商圈夜生活丰富，餐饮选择多',
      '临近会展与商务区，差旅会议场景友好',
      '高层城市景观房，周末短住体验佳',
      '覆盖热门景点动线，出行更省时',
    ],
  },
  北京市: {
    zones: ['国贸', '三里屯', '王府井', '中关村', '望京', '亚奥'],
    distances: ['近地铁 1 号线', '近国贸商圈', '近天安门', '近鸟巢', '近雍和宫'],
    addresses: [
      '北京市朝阳区建国路 108 号',
      '北京市朝阳区三里屯路 19 号',
      '北京市东城区王府井大街 199 号',
      '北京市海淀区中关村大街 88 号',
      '北京市朝阳区望京街 10 号',
    ],
    sellingPoints: [
      '核心商圈覆盖，差旅与会客效率更高',
      '地铁换乘便捷，景点商圈串联顺畅',
      '商务配套成熟，会议与办公更省心',
      '热门景区动线友好，出行时间可控',
      '晚间餐饮丰富，短住体验完整',
    ],
  },
  深圳市: {
    zones: ['福田CBD', '南山科技园', '深圳湾', '罗湖口岸', '会展中心', '前海'],
    distances: ['近地铁 1 号线', '近深圳湾公园', '近会展中心', '近科技园', '近口岸通关点'],
    addresses: [
      '深圳市福田区福华一路 88 号',
      '深圳市南山区科苑路 66 号',
      '深圳市南山区后海大道 1299 号',
      '深圳市罗湖区建设路 2190 号',
      '深圳市前海深港合作区梦海大道 3008 号',
    ],
    sellingPoints: [
      '商务区核心位置，早晚高峰通勤更顺畅',
      '毗邻科技园与总部基地，出差效率高',
      '近海滨休闲带，商旅与放松兼顾',
      '靠近口岸，跨城出行与接待更方便',
      '会展活动期间交通与配套更成熟',
    ],
  },
  杭州市: {
    zones: ['西湖景区', '武林广场', '钱江新城', '城西银泰', '奥体中心', '滨江'],
    distances: ['近西湖', '近龙翔桥地铁站', '近钱塘江', '近湖滨步行街', '近黄龙商圈'],
    addresses: [
      '杭州市上城区延安路 299 号',
      '杭州市拱墅区体育场路 379 号',
      '杭州市江干区富春路 701 号',
      '杭州市西湖区文一西路 588 号',
      '杭州市滨江区江南大道 480 号',
    ],
    sellingPoints: [
      '西湖景区动线友好，游玩与住宿衔接顺',
      '地铁换乘便利，城市通勤成本低',
      '商圈与景区双覆盖，行程安排更灵活',
      '夜景与餐饮资源集中，体验完整',
      '适合周末轻度假与家庭出行',
    ],
  },
  成都市: {
    zones: ['春熙路', '太古里', '天府广场', '高新区', '金融城', '东郊记忆'],
    distances: ['近地铁 2 号线', '近春熙路', '近宽窄巷子', '近天府广场', '近锦里'],
    addresses: [
      '成都市锦江区总府路 19 号',
      '成都市锦江区红星路三段 99 号',
      '成都市青羊区人民中路一段 68 号',
      '成都市高新区天府三街 288 号',
      '成都市武侯区交子大道 500 号',
    ],
    sellingPoints: [
      '热门商圈步行可达，逛吃住一体化',
      '地铁直达景区，短途出行很高效',
      '临近商务写字楼，差旅住宿稳定',
      '夜间生活丰富，周末短住体验好',
      '覆盖核心景点，行程安排更从容',
    ],
  },
  三亚市: {
    zones: ['三亚湾', '海棠湾', '亚龙湾', '大东海', '凤凰机场', '免税城'],
    distances: ['近海边步道', '近免税店', '近海昌梦幻城', '近机场快线', '近椰梦长廊'],
    addresses: [
      '三亚市天涯区海滨路 19 号',
      '三亚市海棠区海棠北路 88 号',
      '三亚市吉阳区亚龙湾路 28 号',
      '三亚市吉阳区大东海旅游区 166 号',
      '三亚市天涯区凤凰路 301 号',
    ],
    sellingPoints: [
      '步行即可到海边，度假氛围更强',
      '亲子设施与泳池配置完善，家庭友好',
      '临近免税购物区，行程安排更高效',
      '机场与景点通达性好，转场更省时',
      '海景房视野开阔，适合休闲放松',
    ],
  },
}

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

const buildHotelListItem = (
  baseHotel: HotelCard,
  city: (typeof CITY_BUCKET)[number],
  localIndex: number,
  globalIndex: number,
  cityBaseSize: number,
): HotelListItem => {
  const variantIndex = Math.floor(localIndex / cityBaseSize)
  const cityProfile = CITY_PROFILES[city]
  const locationZone = cityProfile.zones[localIndex % cityProfile.zones.length]
  const distanceText = cityProfile.distances[(localIndex + 1) % cityProfile.distances.length]
  const detailAddress = cityProfile.addresses[localIndex % cityProfile.addresses.length]
  const priceOffset = ((globalIndex % 9) - 4) * 24
  const reviewCount = 320 + globalIndex * 47
  const collectCount = 680 + globalIndex * 83
  const soldCount = 50 + globalIndex * 8
  const rating = Number((4.1 + (globalIndex % 9) * 0.1).toFixed(1))
  const freeCancel = globalIndex % 4 !== 0
  const breakfast = BREAKFAST_BUCKET[(globalIndex + 2) % BREAKFAST_BUCKET.length]
  const roomType = ROOM_TYPE_BUCKET[globalIndex % ROOM_TYPE_BUCKET.length]
  const bonusTag = BONUS_BUCKET[globalIndex % BONUS_BUCKET.length]
  const specialDesc = cityProfile.sellingPoints[localIndex % cityProfile.sellingPoints.length]
  const normalizedPrice = Math.max(188, baseHotel.price + priceOffset)
  const originalPrice = normalizedPrice + 120 + (globalIndex % 6) * 36

  const normalizedBaseTags = baseHotel.tags.map((tag) => (tag === '免费停车' ? '免费停车场' : tag))

  const tags = uniqueTags([
    ...normalizedBaseTags,
    globalIndex % 3 === 0 ? '近地铁' : '',
    globalIndex % 5 === 0 ? '健身房' : '',
    roomType,
    freeCancel ? '免费取消' : '',
    breakfast !== '不含早餐' ? '含早餐' : '',
    locationZone.includes('古城') ? '近古城' : '',
  ])

  const branchName = `${city.replace(/市$/, '')}${BRANCH_SUFFIX[globalIndex % BRANCH_SUFFIX.length]}`
  const keepOriginalName = variantIndex === 0
  const normalizedName = keepOriginalName
    ? baseHotel.name
    : `${baseHotel.name.replace(/（.*?）/g, '')}（${branchName}）`

  return {
    ...baseHotel,
    itemId: `${city}-${baseHotel.id}-${localIndex}`,
    hotelId: baseHotel.id,
    name: normalizedName,
    city,
    address: `${detailAddress} · ${locationZone}`,
    tags,
    price: normalizedPrice,
    rating,
    reviewCount,
    collectCount,
    soldCount,
    distance: `${distanceText} · ${locationZone}`,
    roomType,
    breakfast,
    freeCancel,
    bonusTag,
    specialDesc,
    locationZone,
    originalPrice,
  }
}

export const HOTEL_LIST_POOL: HotelListItem[] = CITY_GENERATION_PLAN.reduce<HotelListItem[]>(
  (allItems, [city, cityCount]) => {
    const cityBaseHotels = CITY_HOTEL_LIBRARY[city] || []
    if (cityBaseHotels.length === 0) {
      return allItems
    }

    const cityItems = Array.from({ length: cityCount }, (_, localIndex) => {
      const baseHotel = cityBaseHotels[localIndex % cityBaseHotels.length]
      const globalIndex = allItems.length + localIndex
      return buildHotelListItem(baseHotel, city, localIndex, globalIndex, cityBaseHotels.length)
    })

    return [...allItems, ...cityItems]
  },
  [],
)
