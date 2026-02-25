import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { loadRuntimeEntityData, saveRuntimeEntityData } from '../src/entity-data-service'

interface UserMockListItem {
  itemId: string
  hotelId: string
  baseHotelId?: string
  name: string
  star?: string
  address?: string
  tags?: string[]
  price?: number
  promo?: string
  intro?: string
  coverImage?: string
  city?: string
}

interface UserMockRoomPlan {
  id?: string
  name?: string
  area?: string
  bedType?: string
  breakfast?: string
  cancellable?: boolean
  tags?: string[]
  price?: number
  stock?: number
}

interface UserMockHotelDetail {
  id?: string
  name?: string
  star?: string
  address?: string
  facilities?: string[]
  roomPlans?: UserMockRoomPlan[]
}

interface UserMockDataFile {
  listPool: UserMockListItem[]
  detailByHotelId: Record<string, UserMockHotelDetail>
  detailByItemId: Record<string, UserMockHotelDetail>
}

interface RuntimeUser {
  id: number
  username: string
  passwordHash: string
  role: 'ADMIN' | 'USER'
}

interface RuntimeHotel {
  id: string
  name: string
  star: string
  city: string
  address: string
  description?: string
  tags: string[]
  price: number
  promo?: string
  intro?: string
  coverImage?: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
  ownerId: number
  createdAt: string
  updatedAt: string
}

interface RuntimeRoom {
  id: string
  hotelId: string
  name: string
  price: number
  stock: number
  description?: string
  facilities: string[]
  status: 'ON' | 'OFF'
  createdAt: string
  updatedAt: string
}

const MOCK_OWNER_ID = 999
const HOTEL_ID_PREFIX = 'mk-h-'
const ROOM_ID_PREFIX = 'mk-r-'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const mockDataPath = path.resolve(currentDir, '../src/data/user-mock-data.json')

const normalizeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

const normalizeNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const uniqueStrings = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const deduped = new Set<string>()

  value.forEach((item) => {
    const normalized = normalizeText(item)
    if (normalized) {
      deduped.add(normalized)
    }
  })

  return [...deduped]
}

const sanitizeIdPart = (value: string) => value.replace(/[^a-zA-Z0-9-]/g, '-')

const createHotelId = (hotelId: string, usedHotelIds: Set<string>) => {
  const baseId = `${HOTEL_ID_PREFIX}${sanitizeIdPart(hotelId)}`
  let nextId = baseId
  let index = 1

  while (usedHotelIds.has(nextId)) {
    nextId = `${baseId}-${index}`
    index += 1
  }

  usedHotelIds.add(nextId)
  return nextId
}

const createRoomId = (hotelId: string, index: number, usedRoomIds: Set<string>) => {
  const baseId = `${ROOM_ID_PREFIX}${sanitizeIdPart(hotelId)}-${index + 1}`
  let nextId = baseId
  let suffix = 1

  while (usedRoomIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`
    suffix += 1
  }

  usedRoomIds.add(nextId)
  return nextId
}

const buildRoomDescription = (roomPlan: UserMockRoomPlan) => {
  const parts = [normalizeText(roomPlan.area), normalizeText(roomPlan.bedType)].filter(Boolean)
  if (roomPlan.cancellable === false) {
    parts.push('部分条件不可取消')
  }

  return parts.join(' · ')
}

const resolveHotelDetail = (hotelId: string, listItem: UserMockListItem, mockData: UserMockDataFile) => {
  return (
    mockData.detailByHotelId?.[hotelId] ||
    mockData.detailByItemId?.[listItem.itemId] ||
    null
  )
}

const main = async () => {
  const mockDataContent = await fs.readFile(mockDataPath, 'utf-8')
  const mockData = JSON.parse(mockDataContent) as UserMockDataFile

  const runtimeData = loadRuntimeEntityData({
    users: [],
    hotels: [],
    rooms: [],
  })

  const baseHotelMap = new Map<string, UserMockListItem>()
  ;(mockData.listPool || []).forEach((item) => {
    const hotelId = normalizeText(item.hotelId || item.baseHotelId || item.itemId)
    if (!hotelId || baseHotelMap.has(hotelId)) {
      return
    }

    baseHotelMap.set(hotelId, item)
  })

  const existingHotels = (runtimeData.hotels || []).filter(
    (hotel: RuntimeHotel) => !normalizeText(hotel.id).startsWith(HOTEL_ID_PREFIX),
  )
  const existingRooms = (runtimeData.rooms || []).filter(
    (room: RuntimeRoom) => !normalizeText(room.id).startsWith(ROOM_ID_PREFIX),
  )

  const usedHotelIds = new Set<string>(existingHotels.map((hotel: RuntimeHotel) => normalizeText(hotel.id)))
  const usedRoomIds = new Set<string>(existingRooms.map((room: RuntimeRoom) => normalizeText(room.id)))

  const importedHotels: RuntimeHotel[] = []
  const importedRooms: RuntimeRoom[] = []
  const now = new Date().toISOString()

  baseHotelMap.forEach((listItem, sourceHotelId) => {
    const detail = resolveHotelDetail(sourceHotelId, listItem, mockData)
    const importedHotelId = createHotelId(sourceHotelId, usedHotelIds)

    const hotelName = normalizeText(listItem.name, normalizeText(detail?.name, '易宿精选酒店'))
    const hotelCity = normalizeText(listItem.city, '上海市')
    const hotelAddress = normalizeText(listItem.address, normalizeText(detail?.address, `${hotelCity}核心商圈`))
    const hotelStar = normalizeText(listItem.star, normalizeText(detail?.star, '舒适型'))
    const hotelTags = uniqueStrings(listItem.tags).slice(0, 8)

    importedHotels.push({
      id: importedHotelId,
      name: hotelName,
      star: hotelStar,
      city: hotelCity,
      address: hotelAddress,
      description: normalizeText(detail?.name ? `${detail.name} · ${hotelAddress}` : hotelAddress),
      tags: hotelTags,
      price: normalizeNumber(listItem.price, 299),
      promo: normalizeText(listItem.promo),
      intro: normalizeText(listItem.intro),
      coverImage: normalizeText(listItem.coverImage),
      status: 'APPROVED',
      ownerId: MOCK_OWNER_ID,
      createdAt: now,
      updatedAt: now,
    })

    const roomPlans = Array.isArray(detail?.roomPlans) ? detail.roomPlans : []

    roomPlans.forEach((roomPlan, index) => {
      const roomId = createRoomId(sourceHotelId, index, usedRoomIds)
      const roomTags = uniqueStrings(roomPlan.tags)
      const roomBreakfast = normalizeText(roomPlan.breakfast)
      const roomFacilities = uniqueStrings([
        ...roomTags,
        roomBreakfast ? `早餐:${roomBreakfast}` : '',
      ])

      importedRooms.push({
        id: roomId,
        hotelId: importedHotelId,
        name: normalizeText(roomPlan.name, `标准房型 ${index + 1}`),
        price: normalizeNumber(roomPlan.price, normalizeNumber(listItem.price, 299)),
        stock: Math.max(0, normalizeNumber(roomPlan.stock, 8)),
        description: buildRoomDescription(roomPlan),
        facilities: roomFacilities,
        status: 'ON',
        createdAt: now,
        updatedAt: now,
      })
    })
  })

  const users = [...(runtimeData.users || [])] as RuntimeUser[]
  if (!users.some((user) => Number(user.id) === MOCK_OWNER_ID)) {
    users.push({
      id: MOCK_OWNER_ID,
      username: 'mock_owner',
      passwordHash: bcrypt.hashSync('mock123456', 10),
      role: 'USER',
    })
  }

  saveRuntimeEntityData({
    users,
    hotels: [...existingHotels, ...importedHotels],
    rooms: [...existingRooms, ...importedRooms],
  })

  console.log(
    `Imported mock entities -> hotels: ${importedHotels.length}, rooms: ${importedRooms.length}, total hotels: ${
      existingHotels.length + importedHotels.length
    }`,
  )
}

main().catch((error) => {
  console.error('Import user mock entities failed:', error)
  process.exitCode = 1
})
