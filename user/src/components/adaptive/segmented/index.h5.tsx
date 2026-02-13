import { Segmented } from 'antd'
import './style.scss'

export interface AdaptiveSegmentedProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

export default function AdaptiveSegmented({ options, value, onChange }: AdaptiveSegmentedProps) {
  return (
    <Segmented
      className='adaptive-segmented-h5'
      block
      value={value}
      options={[...options]}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  )
}
