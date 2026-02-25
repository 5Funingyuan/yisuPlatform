import fs from 'node:fs'
import path from 'node:path'

type HotelSortType = 'recommend' | 'distance' | 'price' | 'score'
type PriceOption = '不限' | '¥0-200' | '¥200-400' | '¥400-700' | '¥700+'

type HotelStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

interface HotelListItem {
  itemId: string
  hotelId: string
  baseHotelId: string
  name: string
  star: string
  city: string
  address: string
  tags: string[]
  price: number
  promo: string
  intro: string
  coverImage: string
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

interface HotelRoomPlan {
  id: string
  name: string
  coverImage: string
  area: string
  bedType: string
  guestText: string
  breakfast: '含早餐' | '不含早餐'
  cancellable: boolean
  tags: string[]
  originalPrice: number
  price: number
  stock: number
}

interface HotelDetailData {
  id: string
  name: string
  star: string
  address: string
  rating: number
  reviewCount: number
  collectCount: number
  facilities: string[]
  mapLabel: string
  gallery: {
    id: string
    title: string
    imageUrl: string
  }[]
  roomPlans: HotelRoomPlan[]
}

interface UserMockDataFile {
  listPool: HotelListItem[]
  detailByItemId: Record<string, HotelDetailData>
  detailByHotelId: Record<string, HotelDetailData>
}

interface RuntimeHotelRecord {
  id: string
  name: string
  star?: string
  city?: string
  address?: string
  tags?: string[]
  price?: number
  promo?: string
  intro?: string
  coverImage?: string
  status?: HotelStatus | string
}

interface RuntimeRoomRecord {
  id: string
  hotelId: string
  name: string
  price?: number
  stock?: number
  description?: string
  facilities?: string[]
  status?: 'ON' | 'OFF' | string
}

interface UserRuntimeSource {
  hotels: RuntimeHotelRecord[]
  rooms: RuntimeRoomRecord[]
}

interface HotelListQuery {
  scene: string
  city: string
  keyword: string
  selectedStar: string
  selectedPrice: PriceOption
  selectedTags: string[]
  selectedQuickFilters: string[]
  sortType: HotelSortType
  pageNo: number
  pageSize: number
}

interface HotelListPageResult {
  list: HotelListItem[]
  total: number
  pageNo: number
  pageSize: number
  hasMore: boolean
}

interface HotelRoomFilter {
  priceBucket: PriceOption
  breakfastOnly: boolean
  cancellableOnly: boolean
  bigBedOnly: boolean
}

interface DetailPagePayload {
  hotel: HotelDetailData
  roomPlans: HotelRoomPlan[]
  priceUpdateHint: string
}

const DATA_FILE_CANDIDATES = [
  path.resolve(__dirname, 'data/user-mock-data.json'),
  path.resolve(__dirname, '../src/data/user-mock-data.json'),
  path.resolve(process.cwd(), 'src/data/user-mock-data.json'),
  path.resolve(process.cwd(), 'dist/data/user-mock-data.json'),
]

const DATA_FILE_PATH = DATA_FILE_CANDIDATES.find((candidatePath) => fs.existsSync(candidatePath)) || DATA_FILE_CANDIDATES[0]
const HOTEL_SORT_OPTIONS: readonly HotelSortType[] = ['recommend', 'distance', 'price', 'score']
const PRICE_OPTIONS: readonly PriceOption[] = ['不限', '¥0-200', '¥200-400', '¥400-700', '¥700+']

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

const PRICE_REFRESH_OFFSETS = [0, 4, -3, 6, -5, 0, 2] as const

const LIVE_COVER_POOL = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
]

const LIVE_GALLERY_FALLBACK = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
]

const LIVE_ROOM_COVER_POOL = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
]

const LIVE_ROOM_AREA_POOL = ['26㎡', '32㎡', '38㎡', '45㎡', '56㎡'] as const
const LIVE_ROOM_BED_POOL = ['1张大床', '2张单人床', '1张特大床'] as const
const LIVE_BONUS_POOL = ['返10倍积分', '返5倍积分', '返30元红包', '返20元红包'] as const
const LIVE_CITY_DISTANCE_HINTS: Record<string, string> = {
  上海: '近外滩',
  北京: '近国贸商圈',
  深圳: '近会展中心',
  杭州: '近西湖',
  成都: '近春熙路',
  三亚: '近海边步道',
  大理: '近古城门',
}

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

const readDataFile = (): UserMockDataFile => {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    throw new Error(
      `Mock data file not found: ${DATA_FILE_PATH}. Please run "pnpm --filter yisu-platform-server sync:user-mock" first.`,
    )
  }

  const rawText = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
  const parsedData = JSON.parse(rawText) as Partial<UserMockDataFile>

  return {
    listPool: Array.isArray(parsedData.listPool) ? parsedData.listPool : [],
    detailByItemId: parsedData.detailByItemId || {},
    detailByHotelId: parsedData.detailByHotelId || {},
  }
}

const baseUserMockData = readDataFile()

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

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

const parseDistanceToMeter = (distanceText: string) => {
  const matched = distanceText.match(/(\d+(?:\.\d+)?)\s*(km|m)/i)

  if (matched) {
    const amount = Number(matched[1])
    const unit = matched[2].toLowerCase()
    return unit === 'km' ? amount * 1000 : amount
  }

  const distanceIndex = DISTANCE_KEYWORDS.findIndex((keyword) => distanceText.includes(keyword))
  return distanceIndex === -1 ? Number.MAX_SAFE_INTEGER : (distanceIndex + 1) * 100
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

const getRecommendScore = (hotel: HotelListItem, scene: string) => {
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

const sortHotelList = (left: HotelListItem, right: HotelListItem, sortType: HotelSortType, scene: string) => {
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

const parseCsv = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => parseCsv(item))
  }

  return []
}

const parseBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
  }

  return false
}

const parsePositiveInt = (value: unknown, fallback: number) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback
  }

  return Math.floor(numericValue)
}

const parseListQuery = (rawQuery: Record<string, unknown>): HotelListQuery => {
  const sortTypeCandidate = typeof rawQuery.sortType === 'string' ? rawQuery.sortType : 'recommend'
  const selectedPriceCandidate = typeof rawQuery.selectedPrice === 'string' ? rawQuery.selectedPrice : '不限'

  return {
    scene: typeof rawQuery.scene === 'string' ? rawQuery.scene : '',
    city: typeof rawQuery.city === 'string' ? rawQuery.city : '',
    keyword: typeof rawQuery.keyword === 'string' ? rawQuery.keyword : '',
    selectedStar: typeof rawQuery.selectedStar === 'string' ? rawQuery.selectedStar : '不限',
    selectedPrice: PRICE_OPTIONS.includes(selectedPriceCandidate as PriceOption)
      ? (selectedPriceCandidate as PriceOption)
      : '不限',
    selectedTags: parseCsv(rawQuery.selectedTags),
    selectedQuickFilters: parseCsv(rawQuery.selectedQuickFilters),
    sortType: HOTEL_SORT_OPTIONS.includes(sortTypeCandidate as HotelSortType)
      ? (sortTypeCandidate as HotelSortType)
      : 'recommend',
    pageNo: parsePositiveInt(rawQuery.pageNo, 1),
    pageSize: parsePositiveInt(rawQuery.pageSize, 10),
  }
}

const normalizeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim()
  return normalized || fallback
}

const normalizePrice = (value: unknown, fallback: number) => {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) {
    return fallback
  }

  return Math.round(price)
}

const normalizeStock = (value: unknown, fallback: number) => {
  const stock = Number(value)
  if (!Number.isFinite(stock) || stock < 0) {
    return fallback
  }

  return Math.floor(stock)
}

const createStableSeed = (input: string) => {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

const normalizeTagList = (rawTags: unknown): string[] => {
  const tags = Array.isArray(rawTags) ? rawTags : []

  return uniqueStrings(
    tags
      .map((tag) => normalizeText(tag))
      .filter(Boolean)
      .map((tag) => (tag === '免费停车' ? '免费停车场' : tag)),
  )
}

const getLocationZone = (address: string, city: string) => {
  const addressParts = address
    .split(/[·,，]/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (addressParts.length > 1) {
    return addressParts[addressParts.length - 1]
  }

  const cityKeyword = normalizeCityName(city).replace(/市$/, '')
  return cityKeyword ? `${cityKeyword}核心` : '核心商圈'
}

const createRuntimeListItem = (hotel: RuntimeHotelRecord, index: number): HotelListItem => {
  const hotelId = normalizeText(hotel.id)
  const safeCity = normalizeCityName(normalizeText(hotel.city, '上海市')) || '上海市'
  const safeAddress = normalizeText(hotel.address, `${safeCity}核心商圈`)
  const locationZone = getLocationZone(safeAddress, safeCity)
  const seed = createStableSeed(`${hotelId}-${safeCity}-${safeAddress}-${index}`)
  const cityKeyword = safeCity.replace(/市$/, '')

  const normalizedTags = normalizeTagList(hotel.tags)
  const breakfastFlag = normalizedTags.includes('含早餐')
  const freeCancelFlag = normalizedTags.includes('免费取消')
  const roomType =
    normalizedTags.find((tag) => tag.includes('双床') || tag.includes('大床')) || (seed % 2 === 0 ? '大床房' : '双床房')

  const normalizedPrice = normalizePrice(hotel.price, 288 + (seed % 7) * 36)
  const coverImage = normalizeText(hotel.coverImage, LIVE_COVER_POOL[seed % LIVE_COVER_POOL.length])
  const hotelName = normalizeText(hotel.name, `易宿精选酒店（${cityKeyword}店）`)
  const promo = normalizeText(hotel.promo, `${cityKeyword}精选酒店限时优惠，连住更划算`)
  const intro = normalizeText(hotel.intro, `位于${cityKeyword}核心地段，交通便利`) 
  const distanceHint = LIVE_CITY_DISTANCE_HINTS[cityKeyword] || '近核心商圈'

  const reviewCount = 320 + (seed % 6800)
  const collectCount = 560 + (seed % 9800)
  const soldCount = 50 + (seed % 1800)
  const rating = Number((4.2 + (seed % 8) * 0.1).toFixed(1))

  const tags = uniqueStrings([
    ...normalizedTags,
    roomType,
    breakfastFlag ? '含早餐' : '',
    freeCancelFlag ? '免费取消' : '',
    normalizedPrice <= 420 ? '高性价比' : '',
    '近地铁',
  ])

  return {
    itemId: `live-${hotelId}`,
    hotelId,
    baseHotelId: hotelId,
    name: hotelName,
    star: normalizeText(hotel.star, '舒适型'),
    city: safeCity,
    address: `${safeAddress} · ${locationZone}`,
    tags,
    price: normalizedPrice,
    promo,
    intro,
    coverImage,
    locationZone,
    rating,
    reviewCount,
    collectCount,
    soldCount,
    distance: `${distanceHint} · ${locationZone}`,
    roomType,
    breakfast: breakfastFlag ? (seed % 2 === 0 ? '含双早' : '含单早') : '不含早餐',
    freeCancel: freeCancelFlag,
    bonusTag: LIVE_BONUS_POOL[seed % LIVE_BONUS_POOL.length],
    specialDesc: intro,
    originalPrice: normalizedPrice + 120 + (seed % 5) * 20,
  }
}

const createRuntimeRoomPlans = (hotel: RuntimeHotelRecord, listItem: HotelListItem, runtimeRooms: RuntimeRoomRecord[]) => {
  const hotelId = listItem.hotelId
  const activeRooms = runtimeRooms.filter((room) => {
    if (normalizeText(room.hotelId) !== hotelId) {
      return false
    }

    const roomStatus = normalizeText(room.status, 'ON').toUpperCase()
    return roomStatus === 'ON'
  })

  if (activeRooms.length === 0) {
    const seed = createStableSeed(`${hotelId}-fallback-room`)
    const fallbackPrice = Math.max(99, listItem.price)
    const fallbackBreakfast: HotelRoomPlan['breakfast'] = listItem.breakfast.includes('含') ? '含早餐' : '不含早餐'

    return [
      {
        id: `live-${hotelId}-room-1`,
        name: `${listItem.roomType}（标准）`,
        coverImage: listItem.coverImage || LIVE_ROOM_COVER_POOL[seed % LIVE_ROOM_COVER_POOL.length],
        area: LIVE_ROOM_AREA_POOL[seed % LIVE_ROOM_AREA_POOL.length],
        bedType: listItem.roomType.includes('双床') ? '2张单人床' : '1张大床',
        guestText: '2人',
        breakfast: fallbackBreakfast,
        cancellable: listItem.freeCancel,
        tags: uniqueStrings([
          listItem.breakfast.includes('含') ? '含早餐' : '',
          listItem.freeCancel ? '免费取消' : '',
          '在线促销',
        ]),
        originalPrice: listItem.originalPrice,
        price: fallbackPrice,
        stock: 8,
      },
    ]
  }

  return activeRooms.map((room, index) => {
    const seed = createStableSeed(`${hotelId}-${normalizeText(room.id)}-${index}`)
    const roomName = normalizeText(room.name, `${listItem.roomType}（标准）`)
    const roomPrice = normalizePrice(room.price, Math.max(99, listItem.price + (index - 1) * 40))
    const roomStock = normalizeStock(room.stock, 6)
    const roomDesc = normalizeText(room.description)
    const roomFacilities = normalizeTagList(room.facilities)
    const includesBreakfast = roomDesc.includes('含早餐') || listItem.breakfast.includes('含')
    const cancellable = !roomDesc.includes('不可取消') && (listItem.freeCancel || !roomDesc)
    const bedType =
      roomName.includes('双床')
        ? '2张单人床'
        : roomName.includes('特大床')
          ? '1张特大床'
          : roomName.includes('大床')
            ? '1张大床'
            : LIVE_ROOM_BED_POOL[seed % LIVE_ROOM_BED_POOL.length]

    const guestMatched = roomDesc.match(/(\d+)\s*人/)

    const roomBreakfast: HotelRoomPlan['breakfast'] = includesBreakfast ? '含早餐' : '不含早餐'

    return {
      id: normalizeText(room.id, `live-${hotelId}-room-${index + 1}`),
      name: roomName,
      coverImage: normalizeText(hotel.coverImage, LIVE_ROOM_COVER_POOL[seed % LIVE_ROOM_COVER_POOL.length]),
      area: LIVE_ROOM_AREA_POOL[seed % LIVE_ROOM_AREA_POOL.length],
      bedType,
      guestText: guestMatched ? `${guestMatched[1]}人` : '2人',
      breakfast: roomBreakfast,
      cancellable,
      tags: uniqueStrings([
        ...roomFacilities.slice(0, 3),
        includesBreakfast ? '含早餐' : '',
        cancellable ? '免费取消' : '',
      ]),
      originalPrice: Math.max(roomPrice + 60, Math.round(roomPrice * 1.28)),
      price: roomPrice,
      stock: roomStock,
    }
  })
}

const createRuntimeDetail = (
  hotel: RuntimeHotelRecord,
  listItem: HotelListItem,
  runtimeRooms: RuntimeRoomRecord[],
  index: number,
): HotelDetailData => {
  const roomPlans = createRuntimeRoomPlans(hotel, listItem, runtimeRooms)
  const baseFacilities = normalizeTagList(hotel.tags)
  const roomFacilities = roomPlans.flatMap((plan) => plan.tags)
  const facilities = uniqueStrings([...baseFacilities, ...roomFacilities, '免费 Wi-Fi', '24小时前台']).slice(0, 8)

  const coverImage = listItem.coverImage || LIVE_GALLERY_FALLBACK[index % LIVE_GALLERY_FALLBACK.length]

  return {
    id: listItem.hotelId,
    name: listItem.name,
    star: listItem.star,
    address: listItem.address,
    rating: listItem.rating,
    reviewCount: listItem.reviewCount,
    collectCount: listItem.collectCount,
    facilities,
    mapLabel: `${listItem.city.replace(/市$/, '')} / ${listItem.locationZone}`,
    gallery: [
      {
        id: `${listItem.hotelId}-gallery-cover`,
        title: '封面',
        imageUrl: coverImage,
      },
      {
        id: `${listItem.hotelId}-gallery-1`,
        title: '精选',
        imageUrl: LIVE_GALLERY_FALLBACK[index % LIVE_GALLERY_FALLBACK.length],
      },
      {
        id: `${listItem.hotelId}-gallery-2`,
        title: '相册',
        imageUrl: LIVE_GALLERY_FALLBACK[(index + 1) % LIVE_GALLERY_FALLBACK.length],
      },
    ],
    roomPlans,
  }
}

const buildRuntimeData = (runtimeSource?: UserRuntimeSource): UserMockDataFile => {
  if (!runtimeSource) {
    return {
      listPool: [],
      detailByItemId: {},
      detailByHotelId: {},
    }
  }

  const runtimeHotels = Array.isArray(runtimeSource.hotels) ? runtimeSource.hotels : []
  const runtimeRooms = Array.isArray(runtimeSource.rooms) ? runtimeSource.rooms : []

  const approvedHotels = runtimeHotels.filter((hotel) => normalizeText(hotel.status, '').toUpperCase() === 'APPROVED')

  const listPool: HotelListItem[] = []
  const detailByItemId: Record<string, HotelDetailData> = {}
  const detailByHotelId: Record<string, HotelDetailData> = {}

  approvedHotels.forEach((hotel, index) => {
    const hotelId = normalizeText(hotel.id)

    if (!hotelId) {
      return
    }

    const listItem = createRuntimeListItem(hotel, index)
    const detail = createRuntimeDetail(hotel, listItem, runtimeRooms, index)

    listPool.push(listItem)
    detailByItemId[listItem.itemId] = detail
    detailByHotelId[listItem.hotelId] = detail
  })

  return {
    listPool,
    detailByItemId,
    detailByHotelId,
  }
}

const buildMergedData = (runtimeSource?: UserRuntimeSource): UserMockDataFile => {
  const runtimeData = buildRuntimeData(runtimeSource)
  const mergeMode = normalizeText(process.env.USER_MOCK_MERGE_MODE, 'runtime-only').toLowerCase()

  if (runtimeData.listPool.length === 0) {
    return deepClone(baseUserMockData)
  }

  if (mergeMode !== 'hybrid') {
    return runtimeData
  }

  const mergedKeySet = new Set<string>()
  const mergedListPool = [...runtimeData.listPool, ...baseUserMockData.listPool].filter((item) => {
    const dedupeKey = normalizeText(item.baseHotelId || item.hotelId || item.itemId)

    if (mergedKeySet.has(dedupeKey)) {
      return false
    }

    mergedKeySet.add(dedupeKey)
    return true
  })

  return {
    listPool: mergedListPool,
    detailByItemId: {
      ...baseUserMockData.detailByItemId,
      ...runtimeData.detailByItemId,
    },
    detailByHotelId: {
      ...baseUserMockData.detailByHotelId,
      ...runtimeData.detailByHotelId,
    },
  }
}

const resolveDetail = (mergedData: UserMockDataFile, hotelId: string, listItemId?: string): HotelDetailData | null => {
  if (listItemId && mergedData.detailByItemId[listItemId]) {
    return deepClone(mergedData.detailByItemId[listItemId])
  }

  if (mergedData.detailByItemId[hotelId]) {
    return deepClone(mergedData.detailByItemId[hotelId])
  }

  if (mergedData.detailByHotelId[hotelId]) {
    return deepClone(mergedData.detailByHotelId[hotelId])
  }

  const matchedListItem = mergedData.listPool.find(
    (item) => item.itemId === hotelId || item.hotelId === hotelId || item.baseHotelId === hotelId,
  )

  if (matchedListItem) {
    const matchedDetail = mergedData.detailByItemId[matchedListItem.itemId] || mergedData.detailByHotelId[matchedListItem.hotelId]

    if (matchedDetail) {
      return deepClone(matchedDetail)
    }
  }

  return null
}

const normalizeRoomFilter = (rawFilter: Record<string, unknown>): HotelRoomFilter => {
  const priceBucketCandidate = typeof rawFilter.priceBucket === 'string' ? rawFilter.priceBucket : '不限'

  return {
    priceBucket: PRICE_OPTIONS.includes(priceBucketCandidate as PriceOption)
      ? (priceBucketCandidate as PriceOption)
      : '不限',
    breakfastOnly: parseBoolean(rawFilter.breakfastOnly),
    cancellableOnly: parseBoolean(rawFilter.cancellableOnly),
    bigBedOnly: parseBoolean(rawFilter.bigBedOnly),
  }
}

const isDetailPriceMatched = (price: number, priceBucket: PriceOption) => {
  switch (priceBucket) {
    case '¥0-200':
      return price <= 200
    case '¥200-400':
      return price > 200 && price <= 400
    case '¥400-700':
      return price > 400 && price <= 700
    case '¥700+':
      return price > 700
    default:
      return true
  }
}

const isBigBedRoom = (bedType: string) => bedType.includes('大床') || bedType.includes('特大床')

const shouldKeepRoomPlan = (plan: HotelRoomPlan, filter: HotelRoomFilter) => {
  if (!isDetailPriceMatched(plan.price, filter.priceBucket)) {
    return false
  }

  if (filter.breakfastOnly && plan.breakfast !== '含早餐') {
    return false
  }

  if (filter.cancellableOnly && !plan.cancellable) {
    return false
  }

  if (filter.bigBedOnly && !isBigBedRoom(plan.bedType)) {
    return false
  }

  return true
}

const withPriceNoise = (plan: HotelRoomPlan): HotelRoomPlan => {
  const offset = PRICE_REFRESH_OFFSETS[Math.floor(Math.random() * PRICE_REFRESH_OFFSETS.length)]
  const nextPrice = Math.max(99, plan.price + offset)
  const nextOriginalPrice = Math.max(nextPrice + 60, plan.originalPrice + (offset > 0 ? offset : 0))

  return {
    ...plan,
    price: nextPrice,
    originalPrice: nextOriginalPrice,
  }
}

const buildPriceHint = () => {
  const now = new Date()
  const hour = `${now.getHours()}`.padStart(2, '0')
  const minute = `${now.getMinutes()}`.padStart(2, '0')
  return `价格已于 ${hour}:${minute} 刷新，库存和房价可能实时波动`
}

const pickListItemId = (rawFilter: Record<string, unknown>, listItemId?: string) => {
  if (listItemId) {
    return listItemId
  }

  if (typeof rawFilter.listItemId === 'string') {
    return rawFilter.listItemId
  }

  return undefined
}

export const queryUserHotelList = (
  rawQuery: Record<string, unknown>,
  runtimeSource?: UserRuntimeSource,
): HotelListPageResult => {
  const query = parseListQuery(rawQuery)
  const normalizedKeyword = query.keyword.trim().toLowerCase()
  const mergedData = buildMergedData(runtimeSource)

  const filteredList = mergedData.listPool
    .filter((hotel) => {
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
    })
    .sort((left, right) => sortHotelList(left, right, query.sortType, query.scene))

  const startIndex = (query.pageNo - 1) * query.pageSize
  const endIndex = startIndex + query.pageSize
  const list = filteredList.slice(startIndex, endIndex)

  return {
    list,
    total: filteredList.length,
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    hasMore: endIndex < filteredList.length,
  }
}

export const getUserHotelDetailPayload = (
  hotelId: string,
  rawFilter: Record<string, unknown>,
  listItemId?: string,
  runtimeSource?: UserRuntimeSource,
): DetailPagePayload => {
  const mergedData = buildMergedData(runtimeSource)
  const resolvedDetail = resolveDetail(mergedData, hotelId, pickListItemId(rawFilter, listItemId))

  if (!resolvedDetail) {
    throw new Error('酒店详情不存在')
  }

  const roomFilter = normalizeRoomFilter(rawFilter)
  const roomPlans = Array.isArray(resolvedDetail.roomPlans) ? resolvedDetail.roomPlans : []
  const filteredRoomPlans = roomPlans.filter((plan) => shouldKeepRoomPlan(plan, roomFilter))

  return {
    hotel: resolvedDetail,
    roomPlans: filteredRoomPlans,
    priceUpdateHint: buildPriceHint(),
  }
}

export const refreshUserHotelRoomPrices = (
  hotelId: string,
  rawFilter: Record<string, unknown>,
  listItemId?: string,
  runtimeSource?: UserRuntimeSource,
): DetailPagePayload => {
  const mergedData = buildMergedData(runtimeSource)
  const resolvedDetail = resolveDetail(mergedData, hotelId, pickListItemId(rawFilter, listItemId))

  if (!resolvedDetail) {
    throw new Error('酒店详情不存在')
  }

  const roomFilter = normalizeRoomFilter(rawFilter)
  const roomPlans = Array.isArray(resolvedDetail.roomPlans) ? resolvedDetail.roomPlans : []
  const refreshedPlans = roomPlans.map((plan) => withPriceNoise(plan))
  const filteredRoomPlans = refreshedPlans.filter((plan) => shouldKeepRoomPlan(plan, roomFilter))

  return {
    hotel: {
      ...resolvedDetail,
      roomPlans: refreshedPlans,
    },
    roomPlans: filteredRoomPlans,
    priceUpdateHint: buildPriceHint(),
  }
}
