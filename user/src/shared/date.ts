const DAY_IN_MS = 24 * 60 * 60 * 1000

export const formatToYmd = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getToday = () => formatToYmd(new Date())

export const isValidYmd = (dateValue: string) => /^\d{4}-\d{2}-\d{2}$/.test(dateValue)

export const parseYmd = (dateValue: string) => {
  if (!isValidYmd(dateValue)) {
    return null
  }

  const [year, month, day] = dateValue.split('-').map(Number)
  const parsedDate = new Date(year, month - 1, day, 12)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

export const toDaySerial = (dateValue: string) => {
  const parsedDate = parseYmd(dateValue)

  if (!parsedDate) {
    return null
  }

  return Math.floor(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()) / DAY_IN_MS)
}

export const daySerialToYmd = (daySerial: number) => {
  const utcDate = new Date(daySerial * DAY_IN_MS)
  const year = utcDate.getUTCFullYear()
  const month = `${utcDate.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${utcDate.getUTCDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (dateValue: string, days: number) => {
  const baseDaySerial = toDaySerial(dateValue)

  if (baseDaySerial === null) {
    return getToday()
  }

  return daySerialToYmd(baseDaySerial + days)
}

export const normalizeYmd = (dateValue: string | undefined, fallback: string) => {
  if (!dateValue) {
    return fallback
  }

  return isValidYmd(dateValue) ? dateValue : fallback
}

export const isDateRangeValid = (checkInDate: string, checkOutDate: string) => {
  const checkInSerial = toDaySerial(checkInDate)
  const checkOutSerial = toDaySerial(checkOutDate)

  if (checkInSerial === null || checkOutSerial === null) {
    return false
  }

  return checkOutSerial > checkInSerial
}

export const normalizeDateRange = (checkInDate: string, checkOutDate: string, minDate: string) => {
  const minDaySerial = toDaySerial(minDate)
  const checkInSerial = toDaySerial(checkInDate)
  const nextCheckInDate =
    minDaySerial !== null && (checkInSerial === null || checkInSerial < minDaySerial) ? minDate : checkInDate

  if (!isDateRangeValid(nextCheckInDate, checkOutDate)) {
    return {
      checkInDate: nextCheckInDate,
      checkOutDate: addDays(nextCheckInDate, 1),
    }
  }

  return {
    checkInDate: nextCheckInDate,
    checkOutDate,
  }
}

export const getStayNights = (checkInDate: string, checkOutDate: string) => {
  const checkInSerial = toDaySerial(checkInDate)
  const checkOutSerial = toDaySerial(checkOutDate)

  if (checkInSerial === null || checkOutSerial === null) {
    return 1
  }

  return Math.max(1, checkOutSerial - checkInSerial)
}

export interface DateRangeState {
  today: string
  checkInDate: string
  checkOutDate: string
}

export interface DateRangeSetters {
  setToday: (value: string) => void
  setCheckInDate: (value: string) => void
  setCheckOutDate: (value: string) => void
}

export const getSyncedDateRange = (checkInDate: string, checkOutDate: string): DateRangeState => {
  const latestToday = getToday()
  const normalizedRange = normalizeDateRange(checkInDate, checkOutDate, latestToday)

  return {
    today: latestToday,
    ...normalizedRange,
  }
}

export const syncDateRangeState = (state: DateRangeState, setters: DateRangeSetters) => {
  const syncedRange = getSyncedDateRange(state.checkInDate, state.checkOutDate)

  if (state.today !== syncedRange.today) {
    setters.setToday(syncedRange.today)
  }

  if (state.checkInDate !== syncedRange.checkInDate) {
    setters.setCheckInDate(syncedRange.checkInDate)
  }

  if (state.checkOutDate !== syncedRange.checkOutDate) {
    setters.setCheckOutDate(syncedRange.checkOutDate)
  }

  return syncedRange
}
