import { Text, View } from '@tarojs/components'
import type { QuickEntryItem } from '../entry-mock'

interface CouponContent {
  title: string
  subtitle: string
  highlight: string
  actionText: string
}

interface OperationPanelProps {
  coupon: CouponContent
  quickEntries: QuickEntryItem[]
  onCouponClick: () => void
  onQuickEntryClick: (entry: QuickEntryItem) => void
}

const quickEntryToneClassName = (tone: QuickEntryItem['tone']) => {
  if (tone === 'amber') {
    return 'query-quick-entry query-quick-entry--amber'
  }

  if (tone === 'rose') {
    return 'query-quick-entry query-quick-entry--rose'
  }

  return 'query-quick-entry query-quick-entry--sky'
}

export default function OperationPanel({ coupon, quickEntries, onCouponClick, onQuickEntryClick }: OperationPanelProps) {
  return (
    <View className='query-operation-panel'>
      <View className='query-coupon-card' onClick={onCouponClick}>
        <View className='query-coupon-decoration query-coupon-decoration--right' />
        <View className='query-coupon-decoration query-coupon-decoration--left' />

        <View className='query-coupon-content'>
          <View className='query-coupon-main'>
            <Text className='query-coupon-title'>{coupon.title}</Text>
            <Text className='query-coupon-subtitle'>{coupon.subtitle}</Text>
            <View className='query-coupon-highlight'>
              <Text className='query-coupon-highlight-text'>{coupon.highlight}</Text>
            </View>
          </View>

          <View className='query-coupon-action'>
            <Text className='query-coupon-action-text'>{coupon.actionText}</Text>
          </View>
        </View>
      </View>

      <View className='query-quick-grid'>
        {quickEntries.map((entry) => (
          <View key={entry.id} className={quickEntryToneClassName(entry.tone)} onClick={() => onQuickEntryClick(entry)}>
            <Text className='query-quick-title'>{entry.title}</Text>
            <Text className='query-quick-subtitle'>{entry.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
