import { hotelCards } from '../query/mock'

export interface RoomRatePlan {
  id: string
  roomName: string
  bedType: string
  breakfast: string
  cancelRule: string
  merchantPrice: number
  stock: number
}

export interface HotelDetailData {
  id: string
  name: string
  star: string
  address: string
  facilities: string[]
  gallery: string[]
  roomRatePlans: RoomRatePlan[]
}

const DETAIL_RECORDS: Record<string, Omit<HotelDetailData, 'id' | 'name' | 'star' | 'address'>> = {
  'h-001': {
    facilities: ['免费 Wi-Fi', '自助早餐', '健身房', '洗衣房', '会议室', '停车场'],
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    ],
    roomRatePlans: [
      {
        id: 'h-001-rp-1',
        roomName: '行政套房',
        bedType: '1 张特大床',
        breakfast: '含双早',
        cancelRule: '入住前 1 天 18:00 前可免费取消',
        merchantPrice: 928,
        stock: 3,
      },
      {
        id: 'h-001-rp-2',
        roomName: '商务大床房',
        bedType: '1 张大床',
        breakfast: '含单早',
        cancelRule: '不可取消',
        merchantPrice: 468,
        stock: 8,
      },
      {
        id: 'h-001-rp-3',
        roomName: '高级双床房',
        bedType: '2 张单人床',
        breakfast: '不含早餐',
        cancelRule: '入住前 1 天可免费取消',
        merchantPrice: 528,
        stock: 4,
      },
      {
        id: 'h-001-rp-4',
        roomName: '特惠大床房',
        bedType: '1 张大床',
        breakfast: '不含早餐',
        cancelRule: '不可取消',
        merchantPrice: 398,
        stock: 10,
      },
    ],
  },
  'h-002': {
    facilities: ['海景阳台', '儿童乐园', '无边泳池', '健身房', '停车场', '接机服务'],
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    ],
    roomRatePlans: [
      {
        id: 'h-002-rp-1',
        roomName: '海景家庭套房',
        bedType: '1 张特大床 + 1 张沙发床',
        breakfast: '含双早',
        cancelRule: '入住前 2 天 18:00 前可免费取消',
        merchantPrice: 1088,
        stock: 2,
      },
      {
        id: 'h-002-rp-2',
        roomName: '海景豪华双床房',
        bedType: '2 张双人床',
        breakfast: '含双早',
        cancelRule: '入住前 1 天可免费取消',
        merchantPrice: 828,
        stock: 6,
      },
      {
        id: 'h-002-rp-3',
        roomName: '园景大床房',
        bedType: '1 张大床',
        breakfast: '不含早餐',
        cancelRule: '不可取消',
        merchantPrice: 688,
        stock: 9,
      },
      {
        id: 'h-002-rp-4',
        roomName: '观海阳台房',
        bedType: '1 张大床',
        breakfast: '含单早',
        cancelRule: '入住前 1 天可免费取消',
        merchantPrice: 788,
        stock: 5,
      },
    ],
  },
  'h-003': {
    facilities: ['自助洗衣房', '24 小时前台', '商务打印', '行李寄存', '免费 Wi-Fi', '机器人送物'],
    gallery: [
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1631049552240-59c37f38802b?auto=format&fit=crop&w=1200&q=80',
    ],
    roomRatePlans: [
      {
        id: 'h-003-rp-1',
        roomName: '高级大床房',
        bedType: '1 张大床',
        breakfast: '不含早餐',
        cancelRule: '不可取消',
        merchantPrice: 388,
        stock: 6,
      },
      {
        id: 'h-003-rp-2',
        roomName: '精选双床房',
        bedType: '2 张单人床',
        breakfast: '含双早',
        cancelRule: '入住前 1 天可免费取消',
        merchantPrice: 418,
        stock: 4,
      },
      {
        id: 'h-003-rp-3',
        roomName: '轻奢套房',
        bedType: '1 张特大床',
        breakfast: '含双早',
        cancelRule: '入住前 2 天可免费取消',
        merchantPrice: 588,
        stock: 2,
      },
      {
        id: 'h-003-rp-4',
        roomName: '特惠房',
        bedType: '1 张双人床',
        breakfast: '不含早餐',
        cancelRule: '不可取消',
        merchantPrice: 328,
        stock: 8,
      },
    ],
  },
}

export const getHotelDetailById = (hotelId?: string): HotelDetailData => {
  const baseHotel = hotelCards.find((item) => item.id === hotelId) || hotelCards[0]
  const detailRecord = DETAIL_RECORDS[baseHotel.id]

  if (!detailRecord) {
    return {
      id: baseHotel.id,
      name: baseHotel.name,
      star: baseHotel.star,
      address: baseHotel.address,
      facilities: baseHotel.tags,
      gallery: [baseHotel.coverImage],
      roomRatePlans: [
        {
          id: `${baseHotel.id}-fallback`,
          roomName: '标准房',
          bedType: '1 张大床',
          breakfast: '不含早餐',
          cancelRule: '入住前 1 天可免费取消',
          merchantPrice: baseHotel.price,
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
    facilities: detailRecord.facilities,
    gallery: detailRecord.gallery,
    roomRatePlans: detailRecord.roomRatePlans,
  }
}
