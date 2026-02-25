import React from 'react'; 
import { Card, Table } from 'antd'; 
 
const OrderList: React.FC = () => { 
  const columns = [ 
    { title: '订单', dataIndex: 'id',key: 'id' }, 
    { title: '酒店名称', dataIndex: 'hotelName', key: 'hotelName' }, 
    { title: '入住日期', dataIndex: 'checkIn', key: 'checkIn' }, 
    { title: '离店日期', dataIndex: 'checkOut', key: 'checkOut' }, 
    { title: '订单金额', dataIndex: 'amount', key: 'amount' }, 
    { title: '订单状况', dataIndex: 'status', key: 'status' }, 
  ]; 
  return <Card title="订单列表"><Table columns={columns} dataSource={[]} /></Card>; 
} 
export default OrderList; 
