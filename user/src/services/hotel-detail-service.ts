import type { PriceOption } from '../shared/search-options'
import type { HotelDetailData, HotelRoomPlan } from '../pages/detail/mock'
import { requestApi } from './user-api'

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

const normalizeRoomFilter = (filter: HotelRoomFilter) => ({
  priceBucket: filter.priceBucket,
  breakfastOnly: Boolean(filter.breakfastOnly),
  cancellableOnly: Boolean(filter.cancellableOnly),
  bigBedOnly: Boolean(filter.bigBedOnly),
})

export const fetchHotelDetailPayload = async (
  hotelId: string,
  filter: HotelRoomFilter,
  listItemId?: string,
): Promise<DetailPagePayload> => {
  if (!hotelId) {
    throw new Error('酒店ID不能为空')
  }

  return requestApi<DetailPagePayload>({
    path: `/user/hotels/${encodeURIComponent(hotelId)}/detail`,
    method: 'GET',
    data: {
      ...normalizeRoomFilter(filter),
      listItemId,
    },
  })
}

export const refreshHotelRoomPrices = async (
  hotelId: string,
  filter: HotelRoomFilter,
  listItemId?: string,
): Promise<DetailPagePayload> => {
  if (!hotelId) {
    throw new Error('酒店ID不能为空')
  }

  return requestApi<DetailPagePayload>({
    path: `/user/hotels/${encodeURIComponent(hotelId)}/detail/refresh-prices`,
    method: 'POST',
    data: {
      ...normalizeRoomFilter(filter),
      listItemId,
    },
  })
}
