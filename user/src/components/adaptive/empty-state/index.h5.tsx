import { Empty } from 'antd'
import './style.scss'

export interface AdaptiveEmptyStateProps {
  title: string
  description?: string
}

export default function AdaptiveEmptyState({ title, description }: AdaptiveEmptyStateProps) {
  return (
    <div className='adaptive-empty-h5'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description || title} />
    </div>
  )
}
