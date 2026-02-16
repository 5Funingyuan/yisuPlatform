import type { HotelCard } from './types'

export const CITY_HOTEL_LIBRARY: Record<string, HotelCard[]> = {
  上海市: [
    {
      id: 'h-001',
      name: '易宿臻选酒店（上海静安店）',
      star: '高档型',
      address: '上海市静安区南京西路 1266 号',
      tags: ['近地铁', '含早餐', '免费取消'],
      price: 498,
      promo: '核心商圈限时礼遇，连住 2 晚 95 折',
      intro: '步行可达地铁站，通勤与游玩都方便',
      coverImage:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'h-002',
      name: '云栖雅宿酒店（上海陆家嘴店）',
      star: '豪华型',
      address: '上海市浦东新区陆家嘴环路 1000 号',
      tags: ['高层景观', '近商圈', '含早餐'],
      price: 728,
      promo: '周末城市度假专场，含双早与延迟退房',
      intro: '临近陆家嘴核心区，商旅与周末出行兼顾',
      coverImage:
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'h-010',
      name: '锦程海湾酒店（上海虹桥店）',
      star: '高档型',
      address: '上海市闵行区申长路 988 号',
      tags: ['近枢纽', '可开发票', '免费取消'],
      price: 568,
      promo: '差旅快线专享，入住即享接驳权益',
      intro: '靠近虹桥枢纽，跨城出行和会展都高效',
      coverImage:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  北京市: [
    {
      id: 'h-003',
      name: '城市轻居酒店（北京国贸店）',
      star: '舒适型',
      address: '北京市朝阳区建国路 108 号',
      tags: ['近地铁', '可开发票', '24小时前台'],
      price: 456,
      promo: '商旅优选立减 ¥60，支持灵活改期',
      intro: '国贸商圈核心，商务会客与通勤都方便',
      coverImage:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'h-009',
      name: '长安里酒店（北京王府井店）',
      star: '高档型',
      address: '北京市东城区王府井大街 199 号',
      tags: ['近景点', '含早餐', '免费取消'],
      price: 598,
      promo: '景区出游专享，住 2 晚赠城市观光券',
      intro: '步行串联王府井与核心景区，游玩效率高',
      coverImage:
        'https://images.unsplash.com/photo-1519821172141-b5d8a6f3f8e2?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  深圳市: [
    {
      id: 'h-004',
      name: '岭南悦居酒店（深圳会展中心店）',
      star: '高档型',
      address: '深圳市福田区福华一路 88 号',
      tags: ['商务出行', '近地铁', '可开发票'],
      price: 536,
      promo: '会展季差旅礼包，连住 2 晚再减 ¥120',
      intro: '会展与 CBD 双覆盖，差旅通勤更顺畅',
      coverImage:
        'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  杭州市: [
    {
      id: 'h-005',
      name: '秦淮逸宿酒店（杭州西湖店）',
      star: '高档型',
      address: '杭州市上城区延安路 299 号',
      tags: ['近景区', '含早餐', '免费停车'],
      price: 518,
      promo: '西湖周边限时 88 折，含双人下午茶',
      intro: '步行可达湖滨步行街，出游动线更顺',
      coverImage:
        'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101d?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  成都市: [
    {
      id: 'h-006',
      name: '青禾里酒店（成都春熙路店）',
      star: '舒适型',
      address: '成都市锦江区总府路 19 号',
      tags: ['近商圈', '亲子', '免费取消'],
      price: 398,
      promo: '周末亲子套餐，满减叠加返现',
      intro: '商圈步行可达，吃住行方便',
      coverImage:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  三亚市: [
    {
      id: 'h-007',
      name: '海景逸宿酒店（三亚亚龙湾店）',
      star: '豪华型',
      address: '三亚市吉阳区亚龙湾路 28 号',
      tags: ['海景', '亲子', '免费停车'],
      price: 888,
      promo: '海景度假套餐，含双早与亲子乐园票',
      intro: '近海边步道，度假氛围足且亲子友好',
      coverImage:
        'https://images.unsplash.com/photo-1576675784201-0e142b423952?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  大理市: [
    {
      id: 'h-008',
      name: '北纬森林酒店（大理古城店）',
      star: '舒适型',
      address: '大理市古城人民路 66 号',
      tags: ['近古城', '含早餐', '免费取消'],
      price: 428,
      promo: '古城夜游专享，限时赠送下午茶',
      intro: '步行可达古城核心区，慢节奏度假更轻松',
      coverImage:
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    },
  ],
}

export const hotelCards: HotelCard[] = Object.values(CITY_HOTEL_LIBRARY).flat()
