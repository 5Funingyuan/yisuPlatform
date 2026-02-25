import { Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { decodeParam } from '../../shared/route'
import {
  FILTER_TAG_OPTIONS,
  PRICE_OPTIONS,
  STAR_OPTIONS,
  type PriceOption,
  type StarOption,
} from '../../shared/search-options'
import { useHotelListStore } from '../../store/hotelListStore'
import { useSearchDraftStore } from '../../store/search-draft'
import './style.scss'

const normalizeOption = <T extends readonly string[]>(value: string, options: T, fallback: T[number]) => {
  if (options.includes(value as T[number])) {
    return value as T[number]
  }

  return fallback
}

const parseTagValues = (tagText: string) => {
  if (!tagText || tagText === '-' || tagText === '无') {
    return []
  }

  return Array.from(new Set(tagText.split(',').map((tag) => tag.trim()).filter(Boolean)))
}

const optionClassName = (active: boolean) => (active ? 'filter-option is-active' : 'filter-option')

export default function FilterPage() {
  const router = useRouter()
  const params = router.params || {}
  const source = decodeParam(params.source, '')
  const tab = decodeParam(params.tab, 'filter')
  const location = decodeParam(params.location, '未指定')
  const scene = decodeParam(params.scene, '国内')
  const routeStar = decodeParam(params.star, '')
  const routePrice = decodeParam(params.price, '')
  const routeTags = parseTagValues(decodeParam(params.tags, ''))

  const draftStar = useSearchDraftStore((state) => state.selectedStar)
  const draftPrice = useSearchDraftStore((state) => state.selectedPrice)
  const draftTags = useSearchDraftStore((state) => state.selectedTags)
  const patchSearchDraft = useSearchDraftStore((state) => state.patchDraft)

  const listStar = useHotelListStore((state) => state.selectedStar)
  const listPrice = useHotelListStore((state) => state.selectedPrice)
  const listTags = useHotelListStore((state) => state.selectedTags)
  const setListSelectedStar = useHotelListStore((state) => state.setSelectedStar)
  const setListSelectedPrice = useHotelListStore((state) => state.setSelectedPrice)
  const setListSelectedTags = useHotelListStore((state) => state.setSelectedTags)

  const fromListContext = source === 'hotel-list'
  const fallbackStar = fromListContext ? listStar : draftStar
  const fallbackPrice = fromListContext ? listPrice : draftPrice
  const fallbackTags = fromListContext ? listTags : draftTags

  const [selectedStar, setSelectedStar] = useState<StarOption>(
    normalizeOption(routeStar === '-' ? fallbackStar : routeStar || fallbackStar, STAR_OPTIONS, STAR_OPTIONS[0]),
  )
  const [selectedPrice, setSelectedPrice] = useState<PriceOption>(
    normalizeOption(routePrice === '-' ? fallbackPrice : routePrice || fallbackPrice, PRICE_OPTIONS, PRICE_OPTIONS[0]),
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    routeTags.length > 0
      ? routeTags.filter((tag) => FILTER_TAG_OPTIONS.includes(tag as (typeof FILTER_TAG_OPTIONS)[number]))
      : fallbackTags,
  )

  const selectedSummary = `${selectedStar} / ${selectedPrice} / ${selectedTags.length} 标签`

  const toggleTag = (tag: string) => {
    setSelectedTags((previousTags) => {
      if (previousTags.includes(tag)) {
        return previousTags.filter((item) => item !== tag)
      }

      return [...previousTags, tag]
    })
  }

  const handleReset = () => {
    setSelectedStar(STAR_OPTIONS[0])
    setSelectedPrice(PRICE_OPTIONS[0])
    setSelectedTags([])
  }

  const handleApply = async () => {
    patchSearchDraft({
      selectedStar,
      selectedPrice,
      selectedTags,
    })

    if (fromListContext) {
      setListSelectedStar(selectedStar)
      setListSelectedPrice(selectedPrice)
      setListSelectedTags(selectedTags)
    }

    Taro.showToast({ title: '筛选已应用', icon: 'none' })
    await Taro.navigateBack()
  }

  return (
    <View className='filter-page'>
      <View className='filter-card'>
        <Text className='filter-title'>筛选条件</Text>
        <Text className='filter-desc'>可一次完成星级、价格与快捷标签筛选。</Text>

        <View className='filter-info-row'>
          <Text className='filter-info-label'>入口</Text>
          <Text className='filter-info-value'>{tab}</Text>
        </View>
        <View className='filter-info-row'>
          <Text className='filter-info-label'>城市</Text>
          <Text className='filter-info-value'>{location}</Text>
        </View>
        <View className='filter-info-row'>
          <Text className='filter-info-label'>场景</Text>
          <Text className='filter-info-value'>{scene}</Text>
        </View>

        <View className='filter-summary-row'>
          <Text className='filter-summary-label'>当前选择</Text>
          <Text className='filter-summary-value'>{selectedSummary}</Text>
        </View>

        <View className='filter-section'>
          <Text className='filter-section-title'>酒店星级</Text>
          <View className='filter-options-wrap'>
            {STAR_OPTIONS.map((starOption) => (
              <View key={starOption} className={optionClassName(selectedStar === starOption)} onClick={() => setSelectedStar(starOption)}>
                <Text>{starOption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='filter-section-title'>价格区间</Text>
          <View className='filter-options-wrap'>
            {PRICE_OPTIONS.map((priceOption) => (
              <View
                key={priceOption}
                className={optionClassName(selectedPrice === priceOption)}
                onClick={() => setSelectedPrice(priceOption)}
              >
                <Text>{priceOption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='filter-section-title'>快捷标签</Text>
          <View className='filter-options-wrap'>
            {FILTER_TAG_OPTIONS.map((tagOption) => (
              <View
                key={tagOption}
                className={optionClassName(selectedTags.includes(tagOption))}
                onClick={() => toggleTag(tagOption)}
              >
                <Text>{tagOption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='filter-footer'>
          <View className='filter-action-btn is-secondary' onClick={handleReset}>
            <Text>重置</Text>
          </View>

          <View className='filter-action-btn is-primary' onClick={() => void handleApply()}>
            <Text>应用筛选</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
