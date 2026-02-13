import { View, Text } from '@tarojs/components'
import './style.scss'

export interface AdaptiveEmptyStateProps {
  title: string
  description?: string
}

export default function AdaptiveEmptyState({ title, description }: AdaptiveEmptyStateProps) {
  return (
    <View className='adaptive-empty'>
      <Text className='adaptive-empty-title'>{title}</Text>
      {description ? <Text className='adaptive-empty-desc'>{description}</Text> : null}
    </View>
  )
}
