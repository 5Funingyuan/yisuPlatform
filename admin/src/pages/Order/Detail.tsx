import React from 'react'; 
import { Card, Descriptions } from 'antd'; 
import { useParams } from 'react-router-dom'; 
 
const OrderDetail: React.FC = () => { 
  const { id } = useParams(); 
  return ( 
    <Card title={`订单详情 - ${id}`}> 
      <Descriptions bordered> 
        <Descriptions.Item label="联系电话">13800138000</Descriptions.Item> 
        <Descriptions.Item label="入住日期">2024-01-01</Descriptions.Item> 
        <Descriptions.Item label="离店日期">2024-01-03</Descriptions.Item> 
        <Descriptions.Item label="订单金额">¥1299</Descriptions.Item> 
      </Descriptions> 
    </Card> 
  ); 
} 
export default OrderDetail; 
