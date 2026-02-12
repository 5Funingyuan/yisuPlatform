import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import LiteIcon from '../../components/lite-icon'
import { decodeParam } from '../../shared/route'
import { QUERY_PAGE_PATH } from '../../shared/search-context'
import './style.less'

const safeBackToQuery = async () => {
  const pages = Taro.getCurrentPages()

  if (pages.length > 1) {
    await Taro.navigateBack()
    return
  }

  await Taro.reLaunch({ url: QUERY_PAGE_PATH })
}

export default function HotelListPage() {
  const router = useRouter()
  const params = router.params || {}

  const source = decodeParam(params.source)
  const location = decodeParam(params.location)
  const keyword = decodeParam(params.keyword)
  const checkIn = decodeParam(params.checkIn)
  const checkOut = decodeParam(params.checkOut)
  const star = decodeParam(params.star)
  const price = decodeParam(params.price)
  const tagsText = decodeParam(params.tags)

  const tags = tagsText === '-' ? [] : tagsText.split(',').map((tag) => tag.trim()).filter(Boolean)

  return (
    <View className='list-page'>
      <View className='list-card'>
        <Text className='title'>酒店列表页（占位）</Text>
        <Text className='desc'>当前仅实现查询页交互，点击查询后跳转到此页面。</Text>
        {source !== '-' ? <Text className='desc'>来源：{source}</Text> : null}

        <View className='summary'>
          <Text>地点：{location}</Text>
          <Text>关键字：{keyword}</Text>
          <Text>
            日期：{checkIn} ~ {checkOut}
          </Text>
          <Text>星级：{star}</Text>
          <Text>价格：{price}</Text>
          <Text>标签：{tags.length > 0 ? tags.join(' / ') : '无'}</Text>
        </View>

        <View className='back-btn' onClick={() => void safeBackToQuery()}>
          <LiteIcon value='chevron-left' size='16' color='#ffffff' />
          <Text>返回查询页</Text>
        </View>
      </View>
    </View>
  )
}
