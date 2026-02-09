import type { HotelCard } from './types'

export const hotelCards: HotelCard[] = [
  {
    id: 'h-001',
    name: '易宿臻选酒店（深圳会展中心店）',
    star: '高档型',
    address: '深圳市福田区福华三路 88 号',
    tags: ['近地铁', '含早餐', '免费取消'],
    price: 428,
    promo: '会展差旅专属礼遇，连住 2 晚 95 折',
    intro: '步行可达会展中心，商务出行便捷',
    coverImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h-002',
    name: '海景逸宿酒店（三亚湾店）',
    star: '豪华型',
    address: '三亚市天涯区海滨路 19 号',
    tags: ['海景', '亲子', '免费停车'],
    price: 788,
    promo: '暑期家庭套餐，含双早与儿童乐园票',
    intro: '一线海景阳台，亲子度假热门之选',
    coverImage:
      'https://images.unsplash.com/photo-1576675784201-0e142b423952?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h-003',
    name: '城市轻居酒店（杭州西湖店）',
    star: '舒适型',
    address: '杭州市上城区延安路 299 号',
    tags: ['近商圈', '可开发票', '24小时前台'],
    price: 356,
    promo: '提前预订立减 ¥40，支持灵活改期',
    intro: '靠近西湖商圈，轻出行高性价比',
    coverImage:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  },
]
