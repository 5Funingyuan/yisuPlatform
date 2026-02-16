import { Button } from 'antd'
import 'antd/dist/reset.css'
import './style.scss'

export interface AdaptivePrimaryButtonProps {
  loading?: boolean
  text: string
  onClick: () => void
}

export default function AdaptivePrimaryButton({ loading = false, text, onClick }: AdaptivePrimaryButtonProps) {
  return (
    <Button className='adaptive-primary-btn-h5' type='primary' block size='large' loading={loading} onClick={onClick}>
      {text}
    </Button>
  )
}
