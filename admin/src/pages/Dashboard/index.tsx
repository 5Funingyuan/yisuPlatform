import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'
import { UserOutlined, ShoppingOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons'
import { getHotelList } from '@/api/hotel'

interface RecentOrder {
  id: number
  orderNo: string
  hotelName: string
  amount: number
  status: string
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    hotelCount: 0,
    orderCount: 0,
    revenue: 0,
    guestCount: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 获取酒店列表
      const result = await getHotelList()
      console.log('仪表盘获取酒店数据:', result)
      
      // 根据实际返回格式动态处理
      let hotelCount = 0
      
      if (Array.isArray(result)) {
        // 如果直接返回数组
        hotelCount = result.length
      } else if (result && Array.isArray(result.data)) {
        // 如果返回 { data: [] }
        hotelCount = result.data.length
      } else if (result && result.success && Array.isArray(result.data)) {
        // 如果返回 { success: true, data: [] }
        hotelCount = result.data.length
      }
      
      setStats({
        hotelCount: hotelCount,
        orderCount: 32,
        revenue: 45680,
        guestCount: 128
      })
      
      // 模拟最近订单
      setRecentOrders([
        { id: 1, orderNo: 'ORD001', hotelName: '上海希尔顿酒店', amount: 1280, status: '已完成' },
        { id: 2, orderNo: 'ORD002', hotelName: '北京王府半岛酒店', amount: 2380, status: '进行中' },
        { id: 3, orderNo: 'ORD003', hotelName: '广州四季酒店', amount: 1890, status: '已取消' },
      ])
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
    }
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '酒店名称', dataIndex: 'hotelName', key: 'hotelName' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (amount: number) => `¥${amount}` },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ]

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="酒店总数"
              value={stats.hotelCount}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.orderCount}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="入住人数"
              value={stats.guestCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={stats.revenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="最近订单" style={{ marginTop: 16 }}>
        <Table 
          columns={columns} 
          dataSource={recentOrders} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default Dashboard