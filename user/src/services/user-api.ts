import Taro from '@tarojs/taro'

declare const __YISU_API_BASE__: string | undefined
declare const __YISU_WEAPP_DEV_API_BASE__: string | undefined

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

interface RequestApiOptions {
  path: string
  method?: HttpMethod
  data?: Record<string, unknown>
}

const normalizeApiBase = (rawBase: string) => {
  if (!rawBase) {
    return '/api'
  }

  return rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase
}

const readBuildTimeApiBase = () => {
  if (typeof __YISU_API_BASE__ === 'string') {
    return __YISU_API_BASE__
  }

  return ''
}

const readBuildTimeWeappDevApiBase = () => {
  if (typeof __YISU_WEAPP_DEV_API_BASE__ === 'string') {
    return __YISU_WEAPP_DEV_API_BASE__
  }

  return ''
}

const readRuntimeApiBase = () => {
  const runtimeGlobal = typeof globalThis === 'undefined' ? undefined : (globalThis as Record<string, unknown>)

  if (runtimeGlobal && typeof runtimeGlobal.__YISU_API_BASE__ === 'string') {
    return runtimeGlobal.__YISU_API_BASE__
  }

  const processLike = runtimeGlobal?.process as { env?: Record<string, string | undefined> } | undefined
  const envBase = processLike?.env?.TARO_APP_API_BASE
  return typeof envBase === 'string' ? envBase : ''
}

const readRuntimeWeappDevApiBase = () => {
  const runtimeGlobal = typeof globalThis === 'undefined' ? undefined : (globalThis as Record<string, unknown>)

  if (runtimeGlobal && typeof runtimeGlobal.__YISU_WEAPP_DEV_API_BASE__ === 'string') {
    return runtimeGlobal.__YISU_WEAPP_DEV_API_BASE__
  }

  const processLike = runtimeGlobal?.process as { env?: Record<string, string | undefined> } | undefined
  const envBase = processLike?.env?.TARO_APP_WEAPP_DEV_API_BASE
  return typeof envBase === 'string' ? envBase : ''
}

const resolveApiBase = () => {
  const envType = Taro.getEnv()
  const explicitApiBase = readRuntimeApiBase() || readBuildTimeApiBase()
  const weappFallbackBase = readRuntimeWeappDevApiBase() || readBuildTimeWeappDevApiBase()

  if (explicitApiBase) {
    if (envType === Taro.ENV_TYPE.WEAPP && explicitApiBase.startsWith('/')) {
      if (weappFallbackBase) {
        return normalizeApiBase(weappFallbackBase)
      }
      return '/api'
    }

    return normalizeApiBase(explicitApiBase)
  }

  if (envType === Taro.ENV_TYPE.WEAPP) {
    return normalizeApiBase(weappFallbackBase || 'http://127.0.0.1:3001/api')
  }

  return '/api'
}

const API_BASE = resolveApiBase()

const buildUrl = (path: string) => {
  if (!path) {
    return API_BASE
  }

  return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`
}

const unwrapResponse = <T>(response: ApiEnvelope<T> | undefined) => {
  if (!response) {
    throw new Error('服务端未返回响应数据')
  }

  if (!response.success) {
    throw new Error(response.message || '请求失败')
  }

  return response.data
}

export const requestApi = async <T>({ path, method = 'GET', data }: RequestApiOptions): Promise<T> => {
  try {
    const response = await Taro.request<ApiEnvelope<T>>({
      url: buildUrl(path),
      method,
      data,
      timeout: 10000,
    })

    return unwrapResponse(response.data)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('网络请求失败')
  }
}
