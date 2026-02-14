import { Input, Picker, Text, View } from '@tarojs/components'
import LiteIcon from '../../../components/lite-icon'

export type SearchFieldKey = 'scene' | 'keyword' | 'date' | 'room'

interface SearchFormCardProps {
  scenes: readonly string[]
  activeScene: string
  onSceneChange: (scene: string) => void
  cityOptions: readonly string[]
  cityValue: string
  onCityChange: (city: string) => void
  keyword: string
  onKeywordChange: (value: string) => void
  onKeywordConfirm: () => void
  locating: boolean
  onLocate: () => void
  today: string
  checkInDate: string
  checkOutDate: string
  checkOutStartDate: string
  onCheckInChange: (date: string) => void
  onCheckOutChange: (date: string) => void
  checkInText: string
  checkOutText: string
  stayNights: number
  roomSummary: string
  filterSummary: string
  activeField: SearchFieldKey
  onFieldFocus: (field: SearchFieldKey) => void
  searching: boolean
  queryPressing: boolean
  onQueryPressingChange: (nextValue: boolean) => void
  onSearch: () => void
  onFilterEntryClick: () => void
}

const focusClassName = (focused: boolean) => (focused ? 'is-focused' : '')
const sceneTabClassName = (active: boolean) => (active ? 'query-scene-tab is-active' : 'query-scene-tab')
const submitButtonClassName = (queryPressing: boolean, searching: boolean) => {
  const classNames = ['query-submit-button']

  if (queryPressing) {
    classNames.push('is-pressing')
  }

  if (searching) {
    classNames.push('is-loading')
  }

  return classNames.join(' ')
}

const splitDateText = (value: string) => {
  const matched = value.trim().match(/^(\S+)\s+(\S+)$/)

  if (!matched) {
    return {
      secondary: '日期',
      primary: value,
    }
  }

  return {
    secondary: matched[1],
    primary: matched[2],
  }
}

export default function SearchFormCard({
  scenes,
  activeScene,
  onSceneChange,
  cityOptions,
  cityValue,
  onCityChange,
  keyword,
  onKeywordChange,
  onKeywordConfirm,
  locating,
  onLocate,
  today,
  checkInDate,
  checkOutDate,
  checkOutStartDate,
  onCheckInChange,
  onCheckOutChange,
  checkInText,
  checkOutText,
  stayNights,
  roomSummary,
  filterSummary,
  activeField,
  onFieldFocus,
  searching,
  queryPressing,
  onQueryPressingChange,
  onSearch,
  onFilterEntryClick,
}: SearchFormCardProps) {
  const activeTabIndex = Math.max(0, scenes.indexOf(activeScene))
  const checkInParts = splitDateText(checkInText)
  const checkOutParts = splitDateText(checkOutText)

  return (
    <View className='query-search-card'>
      <View className='query-scene-tabs' onClick={() => onFieldFocus('scene')}>
        <View
          className='query-scene-indicator'
          style={{
            width: `${100 / scenes.length}%`,
            transform: `translateX(${activeTabIndex * 100}%)`,
          }}
        />

        <View className='query-scene-grid'>
          {scenes.map((scene) => (
            <View key={scene} className={sceneTabClassName(activeScene === scene)} onClick={() => onSceneChange(scene)}>
              <Text className='query-scene-tab-text'>{scene}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='query-merged-panel'>
        <View className={`query-merged-row query-merged-row--destination ${focusClassName(activeField === 'keyword')}`}>
          <Picker
            mode='selector'
            range={[...cityOptions]}
            onChange={(event) => {
              const optionIndex = Number(event.detail.value)
              const selectedCity = cityOptions[optionIndex] || cityValue
              onCityChange(selectedCity)
              onFieldFocus('keyword')
            }}
          >
            <View className='query-city-block' onClick={() => onFieldFocus('keyword')}>
              <Text className='query-row-kicker'>城市</Text>
              <View className='query-city-main'>
                <Text className='query-city-main-text'>{cityValue}</Text>
                <Text className='query-city-main-arrow'>▼</Text>
              </View>
            </View>
          </Picker>

          <View className='query-merged-vline' />

          <View className='query-keyword-block' onClick={() => onFieldFocus('keyword')}>
            <Text className='query-row-kicker'>关键词</Text>

            <View className='query-search-input-wrap'>
              <LiteIcon value='search' size='14' color='#94a3b8' />

              <Input
                className='query-search-input'
                value={keyword}
                placeholder='位置 / 品牌 / 酒店'
                placeholderClass='query-search-placeholder'
                confirmType='search'
                onFocus={() => onFieldFocus('keyword')}
                onInput={(event) => onKeywordChange(event.detail.value)}
                onConfirm={onKeywordConfirm}
              />
            </View>
          </View>

          <View
            className='query-locate-button'
            onClick={() => {
              onFieldFocus('keyword')
              onLocate()
            }}
          >
            <View className='query-locate-glyph'>
              <View className='query-locate-glyph-dot' />
            </View>
          </View>
        </View>

        {locating ? <Text className='query-locate-hint'>定位中...</Text> : null}

        <View className='query-row-divider' />

        <View className={`query-merged-row query-merged-row--date ${focusClassName(activeField === 'date')}`} onClick={() => onFieldFocus('date')}>
          <View className='query-date-col'>
            <Text className='query-row-kicker'>入住</Text>
            <Picker mode='date' value={checkInDate} start={today} onChange={(event) => onCheckInChange(event.detail.value)}>
              <Text className='query-date-main'>{checkInParts.primary}</Text>
            </Picker>
            <Text className='query-date-sub'>{checkInParts.secondary}</Text>
          </View>

          <View className='query-date-split' />

          <View className='query-date-col'>
            <Text className='query-row-kicker'>离店</Text>
            <Picker mode='date' value={checkOutDate} start={checkOutStartDate} onChange={(event) => onCheckOutChange(event.detail.value)}>
              <Text className='query-date-main'>{checkOutParts.primary}</Text>
            </Picker>
            <Text className='query-date-sub'>{checkOutParts.secondary}</Text>
          </View>

          <View className='query-night-box'>
            <Text className='query-night-main'>{stayNights}晚</Text>
            <Text className='query-night-sub'>{`共${stayNights}晚`}</Text>
          </View>
        </View>

        <View className='query-row-divider' />

        <View className={`query-merged-row query-merged-row--room ${focusClassName(activeField === 'room')}`} onClick={() => onFieldFocus('room')}>
          <View className='query-room-main'>
            <Text className='query-row-kicker'>房间与人数</Text>
            <Text className='query-room-value'>{roomSummary}</Text>
          </View>

          <View className='query-room-split' />

          <View
            className='query-filter-entry'
            onClick={(event) => {
              event.stopPropagation()
              onFilterEntryClick()
            }}
          >
            <Text className='query-filter-entry-main'>价格/星级</Text>
            <Text className='query-filter-entry-sub'>{filterSummary}</Text>
            <LiteIcon value='chevron-right' size='14' color='#94a3b8' />
          </View>
        </View>
      </View>

      <View
        className={submitButtonClassName(queryPressing, searching)}
        onTouchStart={() => onQueryPressingChange(true)}
        onTouchEnd={() => onQueryPressingChange(false)}
        onTouchCancel={() => onQueryPressingChange(false)}
        onClick={onSearch}
      >
        <Text className='query-submit-button-text'>{searching ? '正在查询...' : '查询'}</Text>
      </View>
    </View>
  )
}
