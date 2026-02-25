import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Tag, Input, Tabs, message } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getHotelList, getMyHotels, Hotel } from '@/api/hotel'

const { TabPane } = Tabs

const HotelList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [myHotels, setMyHotels] = useState<Hotel[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()
  
  // 获取当前用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const isLoggedIn = !!userInfo.id

  useEffect(() => {
    if (activeTab === 'all') {
      fetchHotels()
    } else {
      fetchMyHotels()
    }
  }, [activeTab])

  // 获取所有已通过的酒店
  const fetchHotels = async () => {
    setLoading(true)
    try {
      const result = await getHotelList()
      console.log('获取所有酒店:', result)
      
      let hotelData: Hotel[] = []
      if (Array.isArray(result)) {
        hotelData = result
      } else if (result && Array.isArray(result.data)) {
        hotelData = result.data
      }
      
      // 只显示已通过的酒店
      const approvedHotels = hotelData.filter(h => h.status === 'APPROVED')
      setHotels(approvedHotels)
    } catch (error) {
      console.error('获取酒店列表失败:', error)
      message.error('获取酒店列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取我创建的酒店（所有状态）
  const fetchMyHotels = async () => {
    setLoading(true)
    try {
      const result = await getMyHotels()
      console.log('获取我的酒店:', result)
      
      if (Array.isArray(result)) {
        setMyHotels(result)
      } else if (result && Array.isArray(result.data)) {
        setMyHotels(result.data)
      }
    } catch (error) {
      console.error('获取我的酒店失败:', error)
      message.error('获取我的酒店失败')
    } finally {
      setLoading(false)
    }
  }

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      PENDING: { color: 'processing', text: '待审核' },
      APPROVED: { color: 'success', text: '已通过' },
      REJECTED: { color: 'error', text: '已拒绝' }
    }
    const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Hotel) => (
        <Button type="link" onClick={() => navigate(`/hotel/${record.id}`)}>
          {text}
        </Button>
      )
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Hotel) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/hotel/edit/${record.id}`)}
          >
            {record.status === 'APPROVED' ? '查看' : '编辑'}
          </Button>
          {record.status === 'DRAFT' && (
            <Button 
              type="link" 
              style={{ color: '#52c41a' }}
              onClick={() => navigate(`/hotel/${record.id}`)}
            >
              提交审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  // 搜索过滤
  const getFilteredData = () => {
    const data = activeTab === 'all' ? hotels : myHotels
    if (!searchText) return data
    return data.filter(hotel => 
      hotel.name.includes(searchText) || 
      hotel.address.includes(searchText)
    )
  }

  return (
    <Card 
      title="酒店管理" 
      extra={
        <Space>
          <Input
            placeholder="搜索酒店"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          {isLoggedIn && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/hotel/add')}
            >
              新增酒店
            </Button>
          )}
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="所有酒店" key="all" />
        {isLoggedIn && <TabPane tab="我的酒店" key="my" />}
      </Tabs>

      <Table
        columns={columns}
        dataSource={getFilteredData()}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: activeTab === 'all' ? '暂无酒店' : '你还没有创建酒店' }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </Card>
  )
}

export default HotelList