import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HOTEL_LIST_POOL } from '../../user/src/pages/list/mock'
import { getHotelDetailById } from '../../user/src/pages/detail/mock'

interface UserMockDataFile {
  listPool: unknown[]
  detailByItemId: Record<string, unknown>
  detailByHotelId: Record<string, unknown>
}

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const outputPath = path.resolve(currentDir, '../src/data/user-mock-data.json')

const uniqueBaseHotelIds = Array.from(new Set(HOTEL_LIST_POOL.map((item) => item.baseHotelId)))

const detailByItemId: Record<string, unknown> = {}
const detailByHotelId: Record<string, unknown> = {}

HOTEL_LIST_POOL.forEach((item) => {
  const detailData = getHotelDetailById(item.hotelId, item.itemId)
  detailByItemId[item.itemId] = detailData
  detailByHotelId[item.hotelId] = detailData
})

uniqueBaseHotelIds.forEach((baseHotelId) => {
  if (!detailByHotelId[baseHotelId]) {
    detailByHotelId[baseHotelId] = getHotelDetailById(baseHotelId)
  }
})

const main = async () => {
  const payload: UserMockDataFile = {
    listPool: HOTEL_LIST_POOL,
    detailByItemId,
    detailByHotelId,
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')

  console.log(
    `Synced user mock data -> ${outputPath} (list: ${HOTEL_LIST_POOL.length}, base hotels: ${uniqueBaseHotelIds.length})`,
  )
}

main().catch((error) => {
  console.error('Failed to sync user mock data:', error)
  process.exitCode = 1
})
