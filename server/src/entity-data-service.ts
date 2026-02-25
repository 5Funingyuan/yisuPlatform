import fs from 'node:fs'
import path from 'node:path'

export interface RuntimeEntityStore {
  users: any[]
  hotels: any[]
  rooms: any[]
  updatedAt: string
}

const DATA_FILE_CANDIDATES = [
  path.resolve(__dirname, 'data/runtime-entity-data.json'),
  path.resolve(__dirname, '../src/data/runtime-entity-data.json'),
  path.resolve(process.cwd(), 'src/data/runtime-entity-data.json'),
  path.resolve(process.cwd(), 'dist/data/runtime-entity-data.json'),
]

const resolveEntityDataFilePath = () => {
  const existedPath = DATA_FILE_CANDIDATES.find((candidatePath) => fs.existsSync(candidatePath))
  return existedPath || DATA_FILE_CANDIDATES[0]
}

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const normalizeStore = (rawValue: unknown, fallbackStore: RuntimeEntityStore): RuntimeEntityStore => {
  if (!rawValue || typeof rawValue !== 'object') {
    return deepClone(fallbackStore)
  }

  const record = rawValue as Record<string, unknown>
  return {
    users: Array.isArray(record.users) ? (record.users as any[]) : deepClone(fallbackStore.users),
    hotels: Array.isArray(record.hotels) ? (record.hotels as any[]) : deepClone(fallbackStore.hotels),
    rooms: Array.isArray(record.rooms) ? (record.rooms as any[]) : deepClone(fallbackStore.rooms),
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
  }
}

export const loadRuntimeEntityData = (fallbackStore: Omit<RuntimeEntityStore, 'updatedAt'>): RuntimeEntityStore => {
  const normalizedFallback: RuntimeEntityStore = {
    users: deepClone(fallbackStore.users),
    hotels: deepClone(fallbackStore.hotels),
    rooms: deepClone(fallbackStore.rooms),
    updatedAt: new Date().toISOString(),
  }

  const dataFilePath = resolveEntityDataFilePath()

  try {
    if (!fs.existsSync(dataFilePath)) {
      saveRuntimeEntityData(normalizedFallback)
      return normalizedFallback
    }

    const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
    const parsed = JSON.parse(fileContent) as unknown
    return normalizeStore(parsed, normalizedFallback)
  } catch (error) {
    console.error('读取实体数据失败，回退默认数据:', error)
    return normalizedFallback
  }
}

export const saveRuntimeEntityData = (store: Omit<RuntimeEntityStore, 'updatedAt'> | RuntimeEntityStore) => {
  const dataFilePath = resolveEntityDataFilePath()
  const normalizedStore = normalizeStore(store, {
    users: [],
    hotels: [],
    rooms: [],
    updatedAt: new Date().toISOString(),
  })
  normalizedStore.updatedAt = new Date().toISOString()

  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true })
  fs.writeFileSync(dataFilePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, 'utf-8')
}
