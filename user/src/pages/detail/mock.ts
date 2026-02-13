import { hotelCards } from '../query/mock'

export interface HotelRoomPlan {
  id: string
  name: string
  coverImage: string
  area: string
  bedType: string
  guestText: string
  breakfast: '含早餐' | '不含早餐'
  cancellable: boolean
  tags: string[]
  originalPrice: number
  price: number
  stock: number
}

export interface HotelDetailData {
  id: string
  name: string
  star: string
  address: string
  rating: number
  reviewCount: number
  collectCount: number
  facilities: string[]
  mapLabel: string
  gallery: {
    id: string
    title: string
    imageUrl: string
  }[]
  roomPlans: HotelRoomPlan[]
}

const DETAIL_RECORDS: Record<
  string,
  Omit<HotelDetailData, 'id' | 'name' | 'star' | 'address'>
> = {
  'h-001': {
    rating: 4.8,
    reviewCount: 12681,
    collectCount: 9034,
    facilities: ['免费 Wi-Fi', '自助早餐', '健身房', '洗衣房', '会议室', '停车场'],
    mapLabel: '会展中心 / 福田口岸',
    gallery: [
      {
        id: 'g-001',
        title: '封面',
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-002',
        title: '精选',
        imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-003',
        title: '相册',
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
      },
    ],
    roomPlans: [
      {
        id: 'h-001-rp-1',
        name: '行政套房',
        coverImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        area: '58㎡',
        bedType: '1张特大床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['免费取消', '含早餐', '高层景观'],
        originalPrice: 1388,
        price: 928,
        stock: 3,
      },
      {
        id: 'h-001-rp-2',
        name: '商务大床房',
        coverImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        area: '32㎡',
        bedType: '1张大床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: false,
        tags: ['近电梯', '含早餐'],
        originalPrice: 699,
        price: 468,
        stock: 8,
      },
      {
        id: 'h-001-rp-3',
        name: '高级双床房',
        coverImage: 'https://images.unsplash.com/photo-1631049552240-59c37f38802b?auto=format&fit=crop&w=800&q=80',
        area: '35㎡',
        bedType: '2张单人床',
        guestText: '2人',
        breakfast: '不含早餐',
        cancellable: true,
        tags: ['可加床', '免费取消'],
        originalPrice: 738,
        price: 528,
        stock: 4,
      },
      {
        id: 'h-001-rp-4',
        name: '特惠大床房',
        coverImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        area: '28㎡',
        bedType: '1张大床',
        guestText: '2人',
        breakfast: '不含早餐',
        cancellable: false,
        tags: ['限时特惠'],
        originalPrice: 598,
        price: 398,
        stock: 0,
      },
    ],
  },
  'h-002': {
    rating: 4.7,
    reviewCount: 8943,
    collectCount: 6211,
    facilities: ['海景阳台', '儿童乐园', '无边泳池', '健身房', '停车场', '接机服务'],
    mapLabel: '三亚湾 / 海月广场',
    gallery: [
      {
        id: 'g-101',
        title: '封面',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-102',
        title: '精选',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-103',
        title: '相册',
        imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
      },
    ],
    roomPlans: [
      {
        id: 'h-002-rp-1',
        name: '海景家庭套房',
        coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        area: '72㎡',
        bedType: '1张特大床+1张沙发床',
        guestText: '3人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['海景露台', '免费取消', '含早餐'],
        originalPrice: 1688,
        price: 1088,
        stock: 2,
      },
      {
        id: 'h-002-rp-2',
        name: '海景豪华双床房',
        coverImage: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80',
        area: '42㎡',
        bedType: '2张双人床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['高楼层', '免费取消'],
        originalPrice: 1188,
        price: 828,
        stock: 6,
      },
      {
        id: 'h-002-rp-3',
        name: '园景大床房',
        coverImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        area: '32㎡',
        bedType: '1张大床',
        guestText: '2人',
        breakfast: '不含早餐',
        cancellable: false,
        tags: ['性价比'],
        originalPrice: 888,
        price: 688,
        stock: 9,
      },
      {
        id: 'h-002-rp-4',
        name: '观海阳台房',
        coverImage: 'https://images.unsplash.com/photo-1566669437685-0248e70422c9?auto=format&fit=crop&w=800&q=80',
        area: '38㎡',
        bedType: '1张大床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['阳台海景', '免费取消'],
        originalPrice: 1088,
        price: 788,
        stock: 1,
      },
    ],
  },
  'h-003': {
    rating: 4.6,
    reviewCount: 6328,
    collectCount: 3806,
    facilities: ['自助洗衣房', '24小时前台', '商务打印', '行李寄存', '免费 Wi-Fi', '机器人送物'],
    mapLabel: '西湖商圈 / 龙翔桥',
    gallery: [
      {
        id: 'g-201',
        title: '封面',
        imageUrl: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101d?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-202',
        title: '精选',
        imageUrl: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'g-203',
        title: '相册',
        imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
      },
    ],
    roomPlans: [
      {
        id: 'h-003-rp-1',
        name: '高级大床房',
        coverImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        area: '30㎡',
        bedType: '1张大床',
        guestText: '2人',
        breakfast: '不含早餐',
        cancellable: false,
        tags: ['商旅推荐'],
        originalPrice: 568,
        price: 388,
        stock: 6,
      },
      {
        id: 'h-003-rp-2',
        name: '精选双床房',
        coverImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        area: '34㎡',
        bedType: '2张单人床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['免费取消', '含早餐'],
        originalPrice: 648,
        price: 418,
        stock: 4,
      },
      {
        id: 'h-003-rp-3',
        name: '轻奢套房',
        coverImage: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80',
        area: '48㎡',
        bedType: '1张特大床',
        guestText: '2人',
        breakfast: '含早餐',
        cancellable: true,
        tags: ['浴缸', '免费取消'],
        originalPrice: 798,
        price: 588,
        stock: 2,
      },
      {
        id: 'h-003-rp-4',
        name: '特惠房',
        coverImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        area: '24㎡',
        bedType: '1张双人床',
        guestText: '2人',
        breakfast: '不含早餐',
        cancellable: false,
        tags: ['限时特惠'],
        originalPrice: 498,
        price: 328,
        stock: 0,
      },
    ],
  },
}

const cloneRoomPlans = (roomPlans: HotelRoomPlan[]) => roomPlans.map((plan) => ({ ...plan, tags: [...plan.tags] }))

export const getHotelDetailById = (hotelId?: string): HotelDetailData => {
  const baseHotel = hotelCards.find((item) => item.id === hotelId) || hotelCards[0]
  const detailRecord = DETAIL_RECORDS[baseHotel.id]

  if (!detailRecord) {
    return {
      id: baseHotel.id,
      name: baseHotel.name,
      star: baseHotel.star,
      address: baseHotel.address,
      rating: 4.5,
      reviewCount: 2388,
      collectCount: 1568,
      facilities: [...baseHotel.tags],
      mapLabel: '热门商圈',
      gallery: [
        {
          id: 'g-fallback-1',
          title: '封面',
          imageUrl: baseHotel.coverImage,
        },
      ],
      roomPlans: [
        {
          id: `${baseHotel.id}-fallback`,
          name: '标准房',
          coverImage: baseHotel.coverImage,
          area: '30㎡',
          bedType: '1张大床',
          guestText: '2人',
          breakfast: '不含早餐',
          cancellable: true,
          tags: ['免费取消'],
          originalPrice: baseHotel.price + 200,
          price: baseHotel.price,
          stock: 5,
        },
      ],
    }
  }

  return {
    id: baseHotel.id,
    name: baseHotel.name,
    star: baseHotel.star,
    address: baseHotel.address,
    rating: detailRecord.rating,
    reviewCount: detailRecord.reviewCount,
    collectCount: detailRecord.collectCount,
    facilities: [...detailRecord.facilities],
    mapLabel: detailRecord.mapLabel,
    gallery: detailRecord.gallery.map((item) => ({ ...item })),
    roomPlans: cloneRoomPlans(detailRecord.roomPlans),
  }
}
