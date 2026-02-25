import type { PriceOption, SceneOption, StarOption } from '../shared/search-options'
import type { HotelListItem } from '../pages/list/mock'
import { requestApi } from './user-api'

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

const BASE_QUICK_FILTERS = ['含早餐', '免费取消', '高评分', '低价优先'] as const

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

const toCsv = (values: string[]) => values.filter(Boolean).join(',')

export const fetchHotelListPage = async (query: HotelListQuery): Promise<HotelListPageResult> => {
  const safePageNo = Math.max(1, query.pageNo)
  const safePageSize = Math.max(1, query.pageSize)

  const response = await requestApi<HotelListPageResult>({
    path: '/user/hotels',
    method: 'GET',
    data: {
      scene: query.scene,
      city: query.city,
      keyword: query.keyword,
      checkInDate: query.checkInDate,
      checkOutDate: query.checkOutDate,
      selectedStar: query.selectedStar,
      selectedPrice: query.selectedPrice,
      selectedTags: toCsv(query.selectedTags),
      selectedQuickFilters: toCsv(query.selectedQuickFilters),
      sortType: query.sortType,
      pageNo: safePageNo,
      pageSize: safePageSize,
    },
  })

  return {
    list: Array.isArray(response.list) ? response.list : [],
    total: Number.isFinite(response.total) ? response.total : 0,
    pageNo: Number.isFinite(response.pageNo) ? response.pageNo : safePageNo,
    pageSize: Number.isFinite(response.pageSize) ? response.pageSize : safePageSize,
    hasMore: Boolean(response.hasMore),
  }
}
