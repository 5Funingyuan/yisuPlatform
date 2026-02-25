import { ScrollView, Text, View } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import { addDays, getStayNights, normalizeDateRange, parseYmd, toDaySerial } from '../../../shared/date'
import './date-range-calendar.scss'

type SelectingStep = 'checkIn' | 'checkOut'

interface DateRangeCalendarProps {
  visible: boolean
  minDate: string
  initialCheckInDate: string
  initialCheckOutDate: string
  onClose: () => void
  onConfirm: (checkInDate: string, checkOutDate: string) => void
}

interface BlankDayCell {
  kind: 'blank'
  key: string
}

interface RealDayCell {
  kind: 'day'
  key: string
  date: string
  dayOfMonth: number
  disabled: boolean
}

type DayCell = BlankDayCell | RealDayCell

interface MonthSection {
  key: string
  title: string
  cells: DayCell[]
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const
const MONTH_SECTION_COUNT = 6

const formatDisplayDate = (dateValue: string) => {
  const parsedDate = parseYmd(dateValue)
  if (!parsedDate) {
    return '--/--'
  }

  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')
  const weekDay = WEEK_LABELS[parsedDate.getDay()]
  return `${month}/${day} 周${weekDay}`
}

const buildMonthSections = (minDate: string): MonthSection[] => {
  const parsedMinDate = parseYmd(minDate)
  if (!parsedMinDate) {
    return []
  }

  const minDaySerial = toDaySerial(minDate)
  if (minDaySerial === null) {
    return []
  }

  return Array.from({ length: MONTH_SECTION_COUNT }, (_, monthOffset) => {
    const monthDate = new Date(parsedMinDate.getFullYear(), parsedMinDate.getMonth() + monthOffset, 1, 12)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDayWeek = monthDate.getDay()
    const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
    const monthTitle = `${year}年${`${month + 1}`.padStart(2, '0')}月`

    const cells: DayCell[] = []

    for (let blankIndex = 0; blankIndex < firstDayWeek; blankIndex += 1) {
      cells.push({
        kind: 'blank',
        key: `${monthTitle}-blank-${blankIndex}`,
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateValue = `${year}-${`${month + 1}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`
      const daySerial = toDaySerial(dateValue)

      cells.push({
        kind: 'day',
        key: dateValue,
        date: dateValue,
        dayOfMonth: day,
        disabled: daySerial === null || daySerial < minDaySerial,
      })
    }

    const trailingCells = (7 - (cells.length % 7)) % 7
    for (let blankIndex = 0; blankIndex < trailingCells; blankIndex += 1) {
      cells.push({
        kind: 'blank',
        key: `${monthTitle}-trailing-${blankIndex}`,
      })
    }

    return {
      key: `${year}-${month}`,
      title: monthTitle,
      cells,
    }
  })
}

const isInRange = (targetDate: string, checkInDate: string, checkOutDate: string) => {
  const targetSerial = toDaySerial(targetDate)
  const checkInSerial = toDaySerial(checkInDate)
  const checkOutSerial = toDaySerial(checkOutDate)

  if (targetSerial === null || checkInSerial === null || checkOutSerial === null) {
    return false
  }

  return targetSerial > checkInSerial && targetSerial < checkOutSerial
}

export default function DateRangeCalendar({
  visible,
  minDate,
  initialCheckInDate,
  initialCheckOutDate,
  onClose,
  onConfirm,
}: DateRangeCalendarProps) {
  const [draftCheckInDate, setDraftCheckInDate] = useState(initialCheckInDate)
  const [draftCheckOutDate, setDraftCheckOutDate] = useState(initialCheckOutDate)
  const [selectingStep, setSelectingStep] = useState<SelectingStep>('checkOut')

  const monthSections = useMemo(() => buildMonthSections(minDate), [minDate])
  const stayNights = draftCheckOutDate ? getStayNights(draftCheckInDate, draftCheckOutDate) : 0
  const canConfirm = Boolean(draftCheckInDate)
  const selectingHint =
    selectingStep === 'checkIn'
      ? '正在选择入住日期'
      : draftCheckOutDate
        ? '可重新选择离店日期'
        : '请选择离店日期'

  useEffect(() => {
    if (!visible) {
      return
    }

    const normalizedRange = normalizeDateRange(initialCheckInDate, initialCheckOutDate, minDate)
    setDraftCheckInDate(normalizedRange.checkInDate)
    setDraftCheckOutDate(normalizedRange.checkOutDate)
    setSelectingStep('checkOut')
  }, [initialCheckInDate, initialCheckOutDate, minDate, visible])

  const handlePickDate = (dateValue: string, disabled: boolean) => {
    if (disabled) {
      return
    }

    if (!draftCheckInDate || selectingStep === 'checkIn' || (draftCheckInDate && draftCheckOutDate)) {
      setDraftCheckInDate(dateValue)
      setDraftCheckOutDate('')
      setSelectingStep('checkOut')
      return
    }

    const pickedDateSerial = toDaySerial(dateValue)
    const checkInSerial = toDaySerial(draftCheckInDate)

    if (pickedDateSerial === null || checkInSerial === null || pickedDateSerial <= checkInSerial) {
      setDraftCheckInDate(dateValue)
      setDraftCheckOutDate('')
      setSelectingStep('checkOut')
      return
    }

    setDraftCheckOutDate(dateValue)
    setSelectingStep('checkIn')
  }

  const handleConfirm = () => {
    if (!canConfirm) {
      return
    }

    const nextCheckOutDate = draftCheckOutDate || addDays(draftCheckInDate, 1)
    const normalizedRange = normalizeDateRange(draftCheckInDate, nextCheckOutDate, minDate)
    onConfirm(normalizedRange.checkInDate, normalizedRange.checkOutDate)
  }

  if (!visible) {
    return null
  }

  return (
    <View className='query-calendar-mask'>
      <View className='query-calendar-backdrop' onClick={onClose} />

      <View
        className='query-calendar-sheet'
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
          <View className='query-calendar-header'>
            <Text className='query-calendar-title'>选择入住离店日期</Text>
            <Text className='query-calendar-hint'>{selectingHint}</Text>

            <View className='query-calendar-date-summary'>
              <View
                className={`query-calendar-date-chip ${selectingStep === 'checkIn' ? 'is-active' : ''}`}
                onClick={() => setSelectingStep('checkIn')}
              >
                <Text className='query-calendar-chip-label'>入住</Text>
                <Text className='query-calendar-chip-value'>{formatDisplayDate(draftCheckInDate)}</Text>
              </View>

              <View
                className={`query-calendar-date-chip ${selectingStep === 'checkOut' ? 'is-active' : ''}`}
                onClick={() => setSelectingStep('checkOut')}
              >
                <Text className='query-calendar-chip-label'>离店</Text>
                <Text className='query-calendar-chip-value'>
                  {draftCheckOutDate ? formatDisplayDate(draftCheckOutDate) : '请选择'}
                </Text>
              </View>
            </View>

            <View className='query-calendar-stay-pill'>
              <Text>{stayNights > 0 ? `共 ${stayNights} 晚` : '请选择离店日期'}</Text>
            </View>
          </View>

          <View className='query-calendar-week-row'>
            {WEEK_LABELS.map((weekLabel) => (
              <Text key={weekLabel} className='query-calendar-week-item'>
                {weekLabel}
              </Text>
            ))}
          </View>

          <ScrollView className='query-calendar-scroll' scrollY enhanced showScrollbar={false}>
            {monthSections.map((monthSection) => (
              <View key={monthSection.key} className='query-calendar-month'>
                <Text className='query-calendar-month-title'>{monthSection.title}</Text>

                <View className='query-calendar-grid'>
                  {monthSection.cells.map((dayCell) => {
                    if (dayCell.kind === 'blank') {
                      return <View key={dayCell.key} className='query-calendar-day is-empty' />
                    }

                    const isCheckIn = dayCell.date === draftCheckInDate
                    const isCheckOut = dayCell.date === draftCheckOutDate
                    const inDateRange = draftCheckOutDate
                      ? isInRange(dayCell.date, draftCheckInDate, draftCheckOutDate)
                      : false
                    const classNames = ['query-calendar-day']

                    if (dayCell.disabled) {
                      classNames.push('is-disabled')
                    }
                    if (inDateRange) {
                      classNames.push('is-range')
                    }
                    if (isCheckIn) {
                      classNames.push('is-check-in')
                    }
                    if (isCheckOut) {
                      classNames.push('is-check-out')
                    }

                    const dayLabel = isCheckIn ? '入住' : isCheckOut ? '离店' : ''

                    return (
                      <View
                        key={dayCell.key}
                        className={classNames.join(' ')}
                        onClick={() => handlePickDate(dayCell.date, dayCell.disabled)}
                      >
                        <Text className='query-calendar-day-number'>{dayCell.dayOfMonth}</Text>
                        {dayLabel ? <Text className='query-calendar-day-label'>{dayLabel}</Text> : null}
                      </View>
                    )
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View className='query-calendar-footer'>
            <View className='query-calendar-footer-btn is-ghost' onClick={onClose}>
              <Text>取消</Text>
            </View>

            <View
              className={`query-calendar-footer-btn ${canConfirm ? 'is-primary' : 'is-disabled'}`}
              onClick={handleConfirm}
            >
              <Text>确认日期</Text>
            </View>
          </View>
      </View>
    </View>
  )
}
