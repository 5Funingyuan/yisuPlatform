import { buildQueryString, safeDecode } from './route'

export const QUERY_PAGE_PATH = '/pages/query/index'
export const LIST_PAGE_PATH = '/pages/list/index'
export const DETAIL_PAGE_PATH = '/pages/detail/index'

export const LIST_QUERY_KEYS = ['scene', 'keyword', 'location', 'star', 'price', 'tags'] as const

export interface SearchContext {
  scene?: string
  keyword?: string
  location?: string
  star?: string
  price?: string
  tags?: string
}

export const pickSearchContextFromParams = (params: Record<string, string | undefined>): SearchContext => {
  return LIST_QUERY_KEYS.reduce<SearchContext>((result, key) => {
    const decodedValue = safeDecode(params[key])

    if (decodedValue) {
      result[key] = decodedValue
    }

    return result
  }, {})
}

export const buildListUrl = (params: Record<string, string | undefined>) => {
  const queryString = buildQueryString(params)
  return queryString ? `${LIST_PAGE_PATH}?${queryString}` : LIST_PAGE_PATH
}

export const buildDetailUrl = (params: Record<string, string | undefined>) => {
  const queryString = buildQueryString(params)
  return queryString ? `${DETAIL_PAGE_PATH}?${queryString}` : DETAIL_PAGE_PATH
}
