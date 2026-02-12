export const safeDecode = (value?: string) => {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const decodeParam = (value?: string, fallback = '-') => {
  const decodedValue = safeDecode(value)
  return decodedValue || fallback
}

export const buildQueryString = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => Boolean(value && value.trim()))
    .map(([key, value]) => `${key}=${encodeURIComponent(value || '')}`)
    .join('&')
