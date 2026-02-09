import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { AtButton, AtIcon } from 'taro-ui'
import './style.less'

export default function HotelListPage() {
  const router = useRouter()
  const params = router.params || {}

  return (
    <View className='list-page'>
      <View className='list-card'>
        <Text className='title'>酒店列表页（占位）</Text>
        <Text className='desc'>当前仅实现查询页交互，点击查询后跳转到此页面。</Text>

        <View className='summary'>
          <Text>地点：{decodeURIComponent(params.location || '-')}</Text>
          <Text>关键字：{decodeURIComponent(params.keyword || '-')}</Text>
          <Text>
            日期：{decodeURIComponent(params.checkIn || '-')} ~ {decodeURIComponent(params.checkOut || '-')}
          </Text>
          <Text>星级：{decodeURIComponent(params.star || '-')}</Text>
          <Text>价格：{decodeURIComponent(params.price || '-')}</Text>
          <Text>标签：{decodeURIComponent(params.tags || '-') || '无'}</Text>
        </View>

        <AtButton type='primary' className='back-btn' onClick={() => Taro.navigateBack()}>
          <AtIcon value='chevron-left' size='16' color='#ffffff' />
          <Text>返回查询页</Text>
        </AtButton>
      </View>
    </View>
  )
}
