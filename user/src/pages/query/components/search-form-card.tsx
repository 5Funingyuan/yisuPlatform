import { Input, Picker, Text, View } from '@tarojs/components'
import LiteIcon from '../../../components/lite-icon'

export type SearchFieldKey = 'scene' | 'keyword' | 'date' | 'room' | 'hot'

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
  hotTags: readonly string[]
  selectedHotTags: string[]
  onToggleHotTag: (tag: string) => void
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
const hotTagClassName = (selected: boolean) => (selected ? 'query-hot-tag is-selected' : 'query-hot-tag')
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
  hotTags,
  selectedHotTags,
  onToggleHotTag,
  activeField,
  onFieldFocus,
  searching,
  queryPressing,
  onQueryPressingChange,
  onSearch,
  onFilterEntryClick,
}: SearchFormCardProps) {
  const activeTabIndex = Math.max(0, scenes.indexOf(activeScene))

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

      <View
        className={`query-field-card ${focusClassName(activeField === 'keyword')}`}
        onClick={() => onFieldFocus('keyword')}
      >
        <View className='query-keyword-row'>
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
            <View className='query-city-chip'>
              <Text className='query-city-chip-text'>{cityValue}</Text>
              <Text className='query-city-chip-arrow'>▼</Text>
            </View>
          </Picker>

          <View className='query-field-divider' />

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

          <View
            className='query-locate-button'
            onClick={() => {
              onFieldFocus('keyword')
              onLocate()
            }}
          >
            <LiteIcon value='map-pin' size='13' color='#2563eb' />
          </View>
        </View>

        {locating ? <Text className='query-locate-hint'>定位中...</Text> : null}
      </View>

      <View className={`query-field-card ${focusClassName(activeField === 'date')}`} onClick={() => onFieldFocus('date')}>
        <View className='query-date-row'>
          <View className='query-date-col'>
            <Text className='query-field-label'>入住</Text>
            <Picker mode='date' value={checkInDate} start={today} onChange={(event) => onCheckInChange(event.detail.value)}>
              <Text className='query-date-value'>{checkInText}</Text>
            </Picker>
          </View>

          <View className='query-date-divider' />

          <View className='query-date-col'>
            <Text className='query-field-label'>离店</Text>
            <Picker mode='date' value={checkOutDate} start={checkOutStartDate} onChange={(event) => onCheckOutChange(event.detail.value)}>
              <Text className='query-date-value'>{checkOutText}</Text>
            </Picker>
          </View>

          <View className='query-night-pill'>
            <Text className='query-night-pill-text'>{stayNights}晚</Text>
          </View>
        </View>
      </View>

      <View className={`query-field-card ${focusClassName(activeField === 'room')}`} onClick={() => onFieldFocus('room')}>
        <View className='query-room-row'>
          <View className='query-room-main'>
            <Text className='query-field-label'>房间与人数</Text>
            <Text className='query-room-value'>{roomSummary}</Text>
          </View>

          <View className='query-date-divider' />

          <View className='query-filter-entry' onClick={onFilterEntryClick}>
            <Text className='query-filter-entry-text'>{filterSummary}</Text>
            <LiteIcon value='chevron-right' size='14' color='#94a3b8' />
          </View>
        </View>
      </View>

      <View className='query-hot-wrap' onClick={() => onFieldFocus('hot')}>
        <Text className='query-hot-title'>热门目的地</Text>
        <View className='query-hot-list'>
          {hotTags.map((tag) => {
            const selected = selectedHotTags.includes(tag)
            return (
              <View key={tag} className={hotTagClassName(selected)} onClick={() => onToggleHotTag(tag)}>
                <Text className='query-hot-tag-text'>{tag}</Text>
              </View>
            )
          })}
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
