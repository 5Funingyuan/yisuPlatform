export interface MarketingBannerItem {
  id: string
  title: string
  subtitle: string
  cornerTag: string
  ctaText: string
  hotelId: string
  imageUrl: string
}

export const MARKETING_BANNERS: MarketingBannerItem[] = [
  {
    id: 'banner-1',
    title: '春季大促 · 住2晚减188',
    subtitle: '限时88折，热门城市酒店低至5折起',
    cornerTag: '限时福利',
    ctaText: '抢先预订',
    hotelId: 'h-001',
    imageUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-2',
    title: '周末度假专场',
    subtitle: '海景酒店+亲子权益包，叠加返现更省',
    cornerTag: '高转化活动',
    ctaText: '去看看',
    hotelId: 'h-002',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner-3',
    title: '商务差旅优选',
    subtitle: '会展商圈通勤便利，支持灵活取消',
    cornerTag: '企业价',
    ctaText: '立即查房',
    hotelId: 'h-003',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  },
]

export const CITY_OPTIONS = ['上海', '北京', '深圳', '杭州', '成都', '三亚', '大理'] as const

export const HOT_DESTINATION_TAGS = ['北京', '上海', '深圳', '三亚', '大理', '杭州', '成都', '西安'] as const

export interface RoomProfile {
  rooms: number
  adults: number
  children: number
}

export const ROOM_PROFILES: RoomProfile[] = [
  { rooms: 1, adults: 2, children: 0 },
  { rooms: 1, adults: 2, children: 1 },
  { rooms: 2, adults: 3, children: 1 },
  { rooms: 2, adults: 4, children: 2 },
]

export interface QuickEntryItem {
  id: string
  title: string
  subtitle: string
  tone: 'amber' | 'rose' | 'sky'
}

export const QUICK_ENTRIES: QuickEntryItem[] = [
  {
    id: 'rank',
    title: '口碑榜',
    subtitle: '城市精选',
    tone: 'amber',
  },
  {
    id: 'nearby-hot',
    title: '附近热卖',
    subtitle: '2公里内',
    tone: 'rose',
  },
  {
    id: 'deal',
    title: '超值低价',
    subtitle: '7折起',
    tone: 'sky',
  },
]

export const BOTTOM_NAV_ITEMS = ['推荐', '收藏', '权益', '点评', '订单'] as const

export const COUPON_CONTENT = {
  title: '今日专享券包',
  subtitle: '领券后最高再减 ¥220',
  highlight: '酒店红包 x3',
  actionText: '立即领取',
} as const
