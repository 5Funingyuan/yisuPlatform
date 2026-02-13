import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { PRICE_OPTIONS, SCENE_OPTIONS, type PriceOption, type SceneOption } from '../shared/search-options'

const STORAGE_KEY = 'yisu-user-hotel-detail-v1'
const MAX_RECENT_HOTELS = 12

export interface RecentViewedHotel {
  hotelId: string
  name: string
  address: string
  coverImage: string
  rating: number
  viewedAt: number
}

export interface SelectedRoomPlan {
  hotelId: string
  hotelName: string
  roomPlanId: string
  roomName: string
  breakfast: string
  cancellable: boolean
  price: number
  originalPrice: number
  nights: number
  roomCount: number
  totalPrice: number
  selectedAt: number
}

export interface BookingDraftFilter {
  priceBucket: PriceOption
  breakfastOnly: boolean
  cancellableOnly: boolean
  bigBedOnly: boolean
}

export interface BookingDraft {
  hotelId: string
  hotelName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  roomCount: number
  adultCount: number
  childCount: number
  scene: SceneOption
  keyword: string
  filter: BookingDraftFilter
  selectedRoomPlanId: string
  totalPrice: number
  updatedAt: number
}

interface HotelDetailSnapshot {
  recentViewedHotels: RecentViewedHotel[]
  selectedRoomPlan: SelectedRoomPlan | null
  bookingDraft: BookingDraft | null
}

interface HotelDetailStore extends HotelDetailSnapshot {
  pushRecentViewedHotel: (hotel: Omit<RecentViewedHotel, 'viewedAt'> & { viewedAt?: number }) => void
  syncHotelContext: (hotelId: string) => void
  setSelectedRoomPlan: (payload: Omit<SelectedRoomPlan, 'selectedAt'> & { selectedAt?: number }) => void
  patchBookingDraft: (patch: Partial<BookingDraft>) => void
  clearSelectedRoomPlan: () => void
  clearBookingDraft: () => void
}

const normalizeOption = <T extends readonly string[]>(value: string | undefined, options: T, fallback: T[number]) => {
  if (value && options.includes(value as T[number])) {
    return value as T[number]
  }

  return fallback
}

const taroPersistStorage = createJSONStorage<HotelDetailStore>(() => ({
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

const createDefaultFilter = (): BookingDraftFilter => ({
  priceBucket: PRICE_OPTIONS[0],
  breakfastOnly: false,
  cancellableOnly: false,
  bigBedOnly: false,
})

const sanitizeFilter = (filter?: Partial<BookingDraftFilter>): BookingDraftFilter => ({
  priceBucket: normalizeOption(filter?.priceBucket, PRICE_OPTIONS, PRICE_OPTIONS[0]),
  breakfastOnly: Boolean(filter?.breakfastOnly),
  cancellableOnly: Boolean(filter?.cancellableOnly),
  bigBedOnly: Boolean(filter?.bigBedOnly),
})

const createDefaultDraft = (): BookingDraft => ({
  hotelId: '',
  hotelName: '',
  checkInDate: '',
  checkOutDate: '',
  nights: 1,
  roomCount: 1,
  adultCount: 2,
  childCount: 0,
  scene: SCENE_OPTIONS[0],
  keyword: '',
  filter: createDefaultFilter(),
  selectedRoomPlanId: '',
  totalPrice: 0,
  updatedAt: Date.now(),
})

const dedupeRecent = (items: RecentViewedHotel[]) => {
  const uniqueMap = new Map<string, RecentViewedHotel>()

  items.forEach((item) => {
    if (!item.hotelId) {
      return
    }

    if (!uniqueMap.has(item.hotelId)) {
      uniqueMap.set(item.hotelId, item)
    }
  })

  return Array.from(uniqueMap.values()).slice(0, MAX_RECENT_HOTELS)
}

export const useHotelDetailStore = create<HotelDetailStore>()(
  persist(
    (set) => ({
      recentViewedHotels: [],
      selectedRoomPlan: null,
      bookingDraft: null,

      pushRecentViewedHotel: (hotel) => {
        set((state) => {
          const nextHotel: RecentViewedHotel = {
            ...hotel,
            viewedAt: hotel.viewedAt ?? Date.now(),
          }

          const withoutCurrent = state.recentViewedHotels.filter((item) => item.hotelId !== hotel.hotelId)
          return {
            recentViewedHotels: dedupeRecent([nextHotel, ...withoutCurrent]),
          }
        })
      },

      syncHotelContext: (hotelId) => {
        set((state) => {
          const shouldClearSelectedPlan =
            state.selectedRoomPlan && state.selectedRoomPlan.hotelId && state.selectedRoomPlan.hotelId !== hotelId
          const shouldResetDraft = state.bookingDraft && state.bookingDraft.hotelId && state.bookingDraft.hotelId !== hotelId

          if (!shouldClearSelectedPlan && !shouldResetDraft) {
            return state
          }

          const nextDraft = shouldResetDraft
            ? {
                ...createDefaultDraft(),
                hotelId,
              }
            : state.bookingDraft

          return {
            ...state,
            selectedRoomPlan: shouldClearSelectedPlan ? null : state.selectedRoomPlan,
            bookingDraft: nextDraft,
          }
        })
      },

      setSelectedRoomPlan: (payload) => {
        set(() => ({
          selectedRoomPlan: {
            ...payload,
            selectedAt: payload.selectedAt ?? Date.now(),
          },
        }))
      },

      patchBookingDraft: (patch) => {
        set((state) => {
          const baseDraft = state.bookingDraft || createDefaultDraft()
          const nextScene = normalizeOption(patch.scene ?? baseDraft.scene, SCENE_OPTIONS, SCENE_OPTIONS[0])
          const patchFilter = patch.filter ? sanitizeFilter(patch.filter) : undefined
          const nextFilter = patchFilter || baseDraft.filter || createDefaultFilter()

          return {
            bookingDraft: {
              ...baseDraft,
              ...patch,
              scene: nextScene,
              filter: nextFilter,
              updatedAt: Date.now(),
            },
          }
        })
      },

      clearSelectedRoomPlan: () => {
        set(() => ({ selectedRoomPlan: null }))
      },

      clearBookingDraft: () => {
        set(() => ({ bookingDraft: null }))
      },
    }),
    {
      name: STORAGE_KEY,
      storage: taroPersistStorage,
      partialize: (state) => ({
        recentViewedHotels: state.recentViewedHotels,
        selectedRoomPlan: state.selectedRoomPlan,
        bookingDraft: state.bookingDraft,
      }),
    },
  ),
)
