import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import type { MarketingBannerItem } from '../entry-mock'

interface BannerCarouselProps {
  items: MarketingBannerItem[]
  onActionClick: (item: MarketingBannerItem) => void
}

export default function BannerCarousel({ items, onActionClick }: BannerCarouselProps) {
  return (
    <View className='query-banner'>
      <Swiper
        className='query-banner-swiper'
        circular
        autoplay
        interval={3500}
        duration={500}
        indicatorDots
        indicatorColor='rgba(255,255,255,0.45)'
        indicatorActiveColor='#ffffff'
      >
        {items.map((item) => (
          <SwiperItem key={item.id}>
            <View className='query-banner-item'>
              <Image src={item.imageUrl} mode='aspectFill' className='query-banner-image' lazyLoad />
              <View className='query-banner-mask' />

              <View className='query-banner-content'>
                <View className='query-banner-main'>
                  <Text className='query-banner-title'>{item.title}</Text>
                  <Text className='query-banner-subtitle'>{item.subtitle}</Text>
                  <View
                    className='query-banner-cta'
                    onClick={() => onActionClick(item)}
                  >
                    <Text className='query-banner-cta-text'>{item.ctaText}</Text>
                  </View>
                </View>
              </View>
            </View>
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  )
}
