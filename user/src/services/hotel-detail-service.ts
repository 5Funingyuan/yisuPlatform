import type { PriceOption } from '../shared/search-options'
import type { HotelDetailData, HotelRoomPlan } from '../pages/detail/mock'

export interface HotelRoomFilter {
  priceBucket: PriceOption
  breakfastOnly: boolean
  cancellableOnly: boolean
  bigBedOnly: boolean
}

export interface DetailPagePayload {
  hotel: HotelDetailData
  roomPlans: HotelRoomPlan[]
  priceUpdateHint: string
}

type HotelDetailMockModule = typeof import('../pages/detail/mock')

let hotelDetailMockPromise: Promise<HotelDetailMockModule> | null = null

const loadHotelDetailMockModule = async () => {
  if (!hotelDetailMockPromise) {
    hotelDetailMockPromise = import('../pages/detail/mock')
  }

  return hotelDetailMockPromise
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const isBigBedRoom = (bedType: string) => bedType.includes('大床') || bedType.includes('特大床')

const isPriceMatched = (price: number, priceBucket: PriceOption) => {
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

const shouldKeepPlan = (plan: HotelRoomPlan, filter: HotelRoomFilter) => {
  if (!isPriceMatched(plan.price, filter.priceBucket)) {
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
  const offsetRange = [0, 4, -3, 6, -5, 0, 2]
  const offset = offsetRange[Math.floor(Math.random() * offsetRange.length)]
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

export const fetchHotelDetailPayload = async (
  hotelId: string,
  filter: HotelRoomFilter,
  listItemId?: string,
): Promise<DetailPagePayload> => {
  await sleep(460)
  const hotelDetailMock = await loadHotelDetailMockModule()
  const hotel = hotelDetailMock.getHotelDetailById(hotelId, listItemId)
  const filteredRoomPlans = hotel.roomPlans.filter((plan) => shouldKeepPlan(plan, filter))

  return {
    hotel,
    roomPlans: filteredRoomPlans,
    priceUpdateHint: buildPriceHint(),
  }
}

export const refreshHotelRoomPrices = async (
  hotelId: string,
  filter: HotelRoomFilter,
  listItemId?: string,
): Promise<DetailPagePayload> => {
  await sleep(420)
  const hotelDetailMock = await loadHotelDetailMockModule()
  const hotel = hotelDetailMock.getHotelDetailById(hotelId, listItemId)
  const refreshedPlans = hotel.roomPlans.map((plan) => withPriceNoise(plan))
  const filteredRoomPlans = refreshedPlans.filter((plan) => shouldKeepPlan(plan, filter))

  return {
    hotel: {
      ...hotel,
      roomPlans: refreshedPlans,
    },
    roomPlans: filteredRoomPlans,
    priceUpdateHint: buildPriceHint(),
  }
}
