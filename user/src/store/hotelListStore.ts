import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { addDays, getToday, normalizeDateRange } from '../shared/date'
import {
  FILTER_TAG_OPTIONS,
  PRICE_OPTIONS,
  SCENE_OPTIONS,
  STAR_OPTIONS,
  type PriceOption,
  type SceneOption,
  type StarOption,
} from '../shared/search-options'
import type { HotelListItem, HotelSortType } from '../services/hotel-list-service'

const STORAGE_KEY = 'yisu-user-hotel-list-v1'
const DEFAULT_PAGE_SIZE = 10

export interface HotelSearchConditions {
  scene: SceneOption
  city: string
  keyword: string
  checkInDate: string
  checkOutDate: string
  roomSummary: string
}

interface HotelListSnapshot {
  searchConditions: HotelSearchConditions
  sortType: HotelSortType
  selectedStar: StarOption
  selectedPrice: PriceOption
  selectedTags: string[]
  selectedQuickFilters: string[]
  cachedItems: HotelListItem[]
  total: number
  pageNo: number
  pageSize: number
  hasMore: boolean
  cacheQueryKey: string
  updatedAt: number
}

interface HotelListStore extends HotelListSnapshot {
  initializeFromSearch: (
    payload: Partial<HotelSearchConditions> & {
      selectedStar?: string
      selectedPrice?: string
      selectedTags?: string[]
    },
  ) => void
  patchSearchConditions: (patch: Partial<HotelSearchConditions>) => void
  setSortType: (sortType: HotelSortType) => void
  setSelectedStar: (star: string) => void
  setSelectedPrice: (price: string) => void
  setSelectedTags: (tags: string[]) => void
  toggleSelectedTag: (tag: string) => void
  toggleQuickFilter: (quickFilter: string) => void
  sanitizeQuickFilters: (availableQuickFilters: string[]) => void
  resetRefinements: () => void
  replaceCache: (payload: {
    queryKey: string
    list: HotelListItem[]
    total: number
    pageNo: number
    pageSize: number
    hasMore: boolean
  }) => void
  appendCache: (payload: {
    queryKey: string
    list: HotelListItem[]
    total: number
    pageNo: number
    pageSize: number
    hasMore: boolean
  }) => void
  clearCache: () => void
}

const normalizeOption = <T extends readonly string[]>(value: string | undefined, options: T, fallback: T[number]) => {
  if (value && options.includes(value as T[number])) {
    return value as T[number]
  }

  return fallback
}

const unique = <T extends string>(values: readonly T[]) => Array.from(new Set(values)) as T[]

const sanitizeTags = (tags: string[]) =>
  unique(tags.filter((tag) => FILTER_TAG_OPTIONS.includes(tag as (typeof FILTER_TAG_OPTIONS)[number])))

const sanitizeQuickFilters = (selectedFilters: string[], availableFilters: string[]) =>
  unique(selectedFilters.filter((filterValue) => availableFilters.includes(filterValue)))

const createDefaultSnapshot = (): HotelListSnapshot => {
  const today = getToday()
  const normalizedRange = normalizeDateRange(today, addDays(today, 1), today)

  return {
    searchConditions: {
      scene: SCENE_OPTIONS[0],
      city: '上海市',
      keyword: '',
      checkInDate: normalizedRange.checkInDate,
      checkOutDate: normalizedRange.checkOutDate,
      roomSummary: '1间房 · 2成人',
    },
    sortType: 'recommend',
    selectedStar: STAR_OPTIONS[0],
    selectedPrice: PRICE_OPTIONS[0],
    selectedTags: [],
    selectedQuickFilters: [],
    cachedItems: [],
    total: 0,
    pageNo: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    hasMore: true,
    cacheQueryKey: '',
    updatedAt: Date.now(),
  }
}

const taroPersistStorage = createJSONStorage<HotelListStore>(() => ({
  getItem: (name) => {
    try {
      const rawValue = Taro.getStorageSync<string | null>(name)
      return typeof rawValue === 'string' ? rawValue : null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      Taro.setStorageSync(name, value)
    } catch {
      // ignore storage write errors on non-persistent runtimes
    }
  },
  removeItem: (name) => {
    try {
      Taro.removeStorageSync(name)
    } catch {
      // ignore storage remove errors on non-persistent runtimes
    }
  },
}))

export const useHotelListStore = create<HotelListStore>()(
  persist(
    (set) => ({
      ...createDefaultSnapshot(),

      initializeFromSearch: (payload) => {
        set((state) => {
          const nextScene = normalizeOption(payload.scene ?? state.searchConditions.scene, SCENE_OPTIONS, SCENE_OPTIONS[0])
          const normalizedDateRange = normalizeDateRange(
            payload.checkInDate ?? state.searchConditions.checkInDate,
            payload.checkOutDate ?? state.searchConditions.checkOutDate,
            getToday(),
          )

          return {
            ...state,
            searchConditions: {
              scene: nextScene,
              city: payload.city?.trim() || state.searchConditions.city,
              keyword: payload.keyword ?? state.searchConditions.keyword,
              checkInDate: normalizedDateRange.checkInDate,
              checkOutDate: normalizedDateRange.checkOutDate,
              roomSummary: payload.roomSummary || state.searchConditions.roomSummary,
            },
            selectedStar: normalizeOption(payload.selectedStar ?? state.selectedStar, STAR_OPTIONS, STAR_OPTIONS[0]),
            selectedPrice: normalizeOption(payload.selectedPrice ?? state.selectedPrice, PRICE_OPTIONS, PRICE_OPTIONS[0]),
            selectedTags: payload.selectedTags ? sanitizeTags(payload.selectedTags) : state.selectedTags,
            selectedQuickFilters: [],
            cachedItems: [],
            total: 0,
            pageNo: 0,
            hasMore: true,
            cacheQueryKey: '',
            updatedAt: Date.now(),
          }
        })
      },

      patchSearchConditions: (patch) => {
        set((state) => {
          const normalizedDateRange = normalizeDateRange(
            patch.checkInDate ?? state.searchConditions.checkInDate,
            patch.checkOutDate ?? state.searchConditions.checkOutDate,
            getToday(),
          )

          return {
            ...state,
            searchConditions: {
              ...state.searchConditions,
              ...patch,
              scene: normalizeOption(patch.scene ?? state.searchConditions.scene, SCENE_OPTIONS, SCENE_OPTIONS[0]),
              checkInDate: normalizedDateRange.checkInDate,
              checkOutDate: normalizedDateRange.checkOutDate,
            },
            cachedItems: [],
            total: 0,
            pageNo: 0,
            hasMore: true,
            cacheQueryKey: '',
            updatedAt: Date.now(),
          }
        })
      },

      setSortType: (sortType) => {
        set(() => ({
          sortType,
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },

      setSelectedStar: (star) => {
        set(() => ({
          selectedStar: normalizeOption(star, STAR_OPTIONS, STAR_OPTIONS[0]),
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },

      setSelectedPrice: (price) => {
        set(() => ({
          selectedPrice: normalizeOption(price, PRICE_OPTIONS, PRICE_OPTIONS[0]),
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },

      setSelectedTags: (tags) => {
        set(() => ({
          selectedTags: sanitizeTags(tags),
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },

      toggleSelectedTag: (tag) => {
        set((state) => {
          if (!FILTER_TAG_OPTIONS.includes(tag as (typeof FILTER_TAG_OPTIONS)[number])) {
            return state
          }

          const selectedTags = state.selectedTags.includes(tag)
            ? state.selectedTags.filter((item) => item !== tag)
            : unique([...state.selectedTags, tag])

          return {
            ...state,
            selectedTags,
            cachedItems: [],
            total: 0,
            pageNo: 0,
            hasMore: true,
            cacheQueryKey: '',
            updatedAt: Date.now(),
          }
        })
      },

      toggleQuickFilter: (quickFilter) => {
        set((state) => {
          const selectedQuickFilters = state.selectedQuickFilters.includes(quickFilter)
            ? state.selectedQuickFilters.filter((item) => item !== quickFilter)
            : unique([...state.selectedQuickFilters, quickFilter])

          return {
            ...state,
            selectedQuickFilters,
            cachedItems: [],
            total: 0,
            pageNo: 0,
            hasMore: true,
            cacheQueryKey: '',
            updatedAt: Date.now(),
          }
        })
      },

      sanitizeQuickFilters: (availableQuickFilters) => {
        set((state) => {
          const nextQuickFilters = sanitizeQuickFilters(state.selectedQuickFilters, availableQuickFilters)

          if (nextQuickFilters.length === state.selectedQuickFilters.length) {
            return state
          }

          return {
            ...state,
            selectedQuickFilters: nextQuickFilters,
            cachedItems: [],
            total: 0,
            pageNo: 0,
            hasMore: true,
            cacheQueryKey: '',
            updatedAt: Date.now(),
          }
        })
      },

      resetRefinements: () => {
        set(() => ({
          sortType: 'recommend',
          selectedStar: STAR_OPTIONS[0],
          selectedPrice: PRICE_OPTIONS[0],
          selectedTags: [],
          selectedQuickFilters: [],
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },

      replaceCache: ({ queryKey, list, total, pageNo, pageSize, hasMore }) => {
        set(() => ({
          cachedItems: list,
          total,
          pageNo,
          pageSize,
          hasMore,
          cacheQueryKey: queryKey,
          updatedAt: Date.now(),
        }))
      },

      appendCache: ({ queryKey, list, total, pageNo, pageSize, hasMore }) => {
        set((state) => {
          const mergedItems =
            state.cacheQueryKey === queryKey ? [...state.cachedItems, ...list] : list

          return {
            ...state,
            cachedItems: mergedItems,
            total,
            pageNo,
            pageSize,
            hasMore,
            cacheQueryKey: queryKey,
            updatedAt: Date.now(),
          }
        })
      },

      clearCache: () => {
        set(() => ({
          cachedItems: [],
          total: 0,
          pageNo: 0,
          hasMore: true,
          cacheQueryKey: '',
          updatedAt: Date.now(),
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      storage: taroPersistStorage,
      partialize: (state) => ({
        searchConditions: state.searchConditions,
        sortType: state.sortType,
        selectedStar: state.selectedStar,
        selectedPrice: state.selectedPrice,
        selectedTags: state.selectedTags,
        selectedQuickFilters: state.selectedQuickFilters,
        cachedItems: state.cachedItems,
        total: state.total,
        pageNo: state.pageNo,
        pageSize: state.pageSize,
        hasMore: state.hasMore,
        cacheQueryKey: state.cacheQueryKey,
        updatedAt: state.updatedAt,
      }),
    },
  ),
)
