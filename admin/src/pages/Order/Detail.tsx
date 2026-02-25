import React from 'react'
import { Card } from 'antd'
import { useParams } from 'react-router-dom'

const OrderDetail: React.FC = () => {
  const { id } = useParams()
  
  return (
    <Card title={`订单详情 - 订单号: ${id}`}>
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        订单详情开发中...
      </div>
    </Card>
  )
}

export default OrderDetail
