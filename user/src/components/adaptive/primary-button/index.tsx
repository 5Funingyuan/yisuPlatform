import { View, Text } from '@tarojs/components'
import './style.scss'

export interface AdaptivePrimaryButtonProps {
  loading?: boolean
  text: string
  onClick: () => void
}

export default function AdaptivePrimaryButton({ loading = false, text, onClick }: AdaptivePrimaryButtonProps) {
  return (
    <View className={`adaptive-primary-btn ${loading ? 'is-loading' : ''}`} onClick={() => !loading && onClick()}>
      <Text>{text}</Text>
    </View>
  )
}
