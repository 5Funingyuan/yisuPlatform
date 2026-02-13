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

const STORAGE_KEY = 'yisu-user-search-draft-v1'

const normalizeOption = <T extends readonly string[]>(value: string | undefined, options: T, fallback: T[number]) => {
  if (value && options.includes(value as T[number])) {
    return value as T[number]
  }

  return fallback
}

const createDefaultDraft = () => {
  const today = getToday()
  const normalizedRange = normalizeDateRange(today, addDays(today, 1), today)

  return {
    scene: SCENE_OPTIONS[0] as SceneOption,
    keyword: '深圳会展中心',
    locationName: '上海',
    selectedStar: STAR_OPTIONS[0] as StarOption,
    selectedPrice: PRICE_OPTIONS[0] as PriceOption,
    selectedTags: ['亲子', '免费停车场'],
    checkInDate: normalizedRange.checkInDate,
    checkOutDate: normalizedRange.checkOutDate,
    updatedAt: Date.now(),
  }
}

type SearchDraftSnapshot = ReturnType<typeof createDefaultDraft>

interface SearchDraftStore extends SearchDraftSnapshot {
  patchDraft: (patch: Partial<SearchDraftSnapshot>) => void
  syncDateRange: () => void
  resetDraft: () => void
}

const taroPersistStorage = createJSONStorage<SearchDraftStore>(() => ({
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

const sanitizeTags = (tags: string[]) =>
  Array.from(new Set(tags.filter((tag) => FILTER_TAG_OPTIONS.includes(tag as (typeof FILTER_TAG_OPTIONS)[number]))))

export const useSearchDraftStore = create<SearchDraftStore>()(
  persist(
    (set, get) => ({
      ...createDefaultDraft(),
      patchDraft: (patch) => {
        set((state) => {
          const nextScene = normalizeOption(patch.scene ?? state.scene, SCENE_OPTIONS, SCENE_OPTIONS[0])
          const nextStar = normalizeOption(patch.selectedStar ?? state.selectedStar, STAR_OPTIONS, STAR_OPTIONS[0])
          const nextPrice = normalizeOption(patch.selectedPrice ?? state.selectedPrice, PRICE_OPTIONS, PRICE_OPTIONS[0])
          const nextTags = patch.selectedTags ? sanitizeTags(patch.selectedTags) : state.selectedTags
          const fallbackCheckIn = patch.checkInDate ?? state.checkInDate
          const fallbackCheckOut = patch.checkOutDate ?? state.checkOutDate
          const normalizedDateRange = normalizeDateRange(fallbackCheckIn, fallbackCheckOut, getToday())

          return {
            ...state,
            ...patch,
            scene: nextScene,
            selectedStar: nextStar,
            selectedPrice: nextPrice,
            selectedTags: nextTags,
            checkInDate: normalizedDateRange.checkInDate,
            checkOutDate: normalizedDateRange.checkOutDate,
            updatedAt: Date.now(),
          }
        })
      },
      syncDateRange: () => {
        const state = get()
        const normalizedDateRange = normalizeDateRange(state.checkInDate, state.checkOutDate, getToday())

        if (
          normalizedDateRange.checkInDate === state.checkInDate &&
          normalizedDateRange.checkOutDate === state.checkOutDate
        ) {
          return
        }

        set({
          checkInDate: normalizedDateRange.checkInDate,
          checkOutDate: normalizedDateRange.checkOutDate,
          updatedAt: Date.now(),
        })
      },
      resetDraft: () => set(createDefaultDraft()),
    }),
    {
      name: STORAGE_KEY,
      storage: taroPersistStorage,
      partialize: (state) => ({
        scene: state.scene,
        keyword: state.keyword,
        locationName: state.locationName,
        selectedStar: state.selectedStar,
        selectedPrice: state.selectedPrice,
        selectedTags: state.selectedTags,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        updatedAt: state.updatedAt,
      }),
    },
  ),
)
