import { View, Text } from '@tarojs/components'
import './style.scss'

export interface AdaptiveSegmentedProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

export default function AdaptiveSegmented({ options, value, onChange }: AdaptiveSegmentedProps) {
  return (
    <View className='adaptive-segmented'>
      {options.map((option) => (
        <View
          key={option}
          className={`adaptive-segmented-item ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          <Text>{option}</Text>
        </View>
      ))}
    </View>
  )
}
