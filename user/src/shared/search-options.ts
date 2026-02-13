export const SCENE_OPTIONS = ['国内', '海外', '钟点房', '民宿'] as const
export const STAR_OPTIONS = ['不限', '经济型', '舒适型', '高档型', '豪华型'] as const
export const PRICE_OPTIONS = ['不限', '¥0-200', '¥200-400', '¥400-700', '¥700+'] as const
export const FILTER_TAG_OPTIONS = [
  '亲子',
  '豪华',
  '免费停车场',
  '含早餐',
  '免费取消',
  '近地铁',
  '可开发票',
  '健身房',
  '近古城',
  '海景',
] as const

export type SceneOption = (typeof SCENE_OPTIONS)[number]
export type StarOption = (typeof STAR_OPTIONS)[number]
export type PriceOption = (typeof PRICE_OPTIONS)[number]
