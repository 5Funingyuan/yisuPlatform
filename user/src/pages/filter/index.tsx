import { Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { decodeParam } from '../../shared/route'
import './style.scss'

export default function FilterPage() {
  const router = useRouter()
  const params = router.params || {}
  const tab = decodeParam(params.tab, 'filter')
  const location = decodeParam(params.location, '未指定')
  const star = decodeParam(params.star, '不限')
  const price = decodeParam(params.price, '不限')
  const tags = decodeParam(params.tags, '无')
  const scene = decodeParam(params.scene, '国内')

  return (
    <View className='filter-page'>
      <View className='filter-card'>
        <Text className='filter-title'>筛选页（占位）</Text>
        <Text className='filter-desc'>已从列表页跳转，后续可在此扩展完整筛选能力。</Text>

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
        <View className='filter-info-row'>
          <Text className='filter-info-label'>星级</Text>
          <Text className='filter-info-value'>{star}</Text>
        </View>
        <View className='filter-info-row'>
          <Text className='filter-info-label'>价格</Text>
          <Text className='filter-info-value'>{price}</Text>
        </View>
        <View className='filter-info-row'>
          <Text className='filter-info-label'>标签</Text>
          <Text className='filter-info-value'>{tags}</Text>
        </View>

        <View
          className='filter-back-btn'
          onClick={() => {
            void Taro.navigateBack()
          }}
        >
          <Text>返回列表</Text>
        </View>
      </View>
    </View>
  )
}
