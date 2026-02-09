import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import { hotelCards } from '../query/mock'
import './style.less'

export default function HotelDetailPage() {
  const router = useRouter()
  const hotelId = router.params?.id
  const hotel = hotelCards.find((item) => item.id === hotelId) || hotelCards[0]

  return (
    <View className='detail-page'>
      <View className='hero'>
        <Text className='hotel-name'>{hotel.name}</Text>
        <Text className='hotel-promo'>{hotel.promo}</Text>
      </View>

      <View className='detail-card'>
        <Text className='line'>星级：{hotel.star}</Text>
        <Text className='line'>地址：{hotel.address}</Text>
        <Text className='line'>特色：{hotel.tags.join(' / ')}</Text>
        <Text className='line'>价格：¥{hotel.price} 起/晚</Text>

        <AtButton className='back-btn' type='primary' onClick={() => Taro.navigateBack()}>
          返回上一页
        </AtButton>
      </View>
    </View>
  )
}
