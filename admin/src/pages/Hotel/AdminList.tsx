import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Tabs,
  Badge
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ArrowLeftOutlined  // 添加返回图标
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAdminHotelList, approveHotel, rejectHotel, Hotel } from '@/api/hotel'

const { TabPane } = Tabs

const AdminHotelList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllHotels()
  }, [])

  // 获取所有酒店
  const fetchAllHotels = async () => {
    setLoading(true)
    try {
      const res = await getAdminHotelList()
      console.log('管理员获取所有酒店:', res)
      
      // ✅ 关键修复：确保正确设置数据
      if (res && res.data) {
        setHotels(res.data)
        console.log('设置的酒店数据:', res.data)
      } else if (Array.isArray(res)) {
        setHotels(res)
      } else {
        console.error('数据格式错误:', res)
        setHotels([])
      }
    } catch (error) {
      console.error('获取所有酒店失败:', error)
      message.error('获取所有酒店失败')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // 审核通过
  const handleApprove = (record: Hotel) => {
    Modal.confirm({
      title: '审核通过',
      content: `确定要通过酒店「${record.name}」的审核吗？`,
      onOk: async () => {
        try {
          await approveHotel(record.id)
          message.success('审核通过成功')
          fetchAllHotels() // 刷新列表
        } catch (error) {
          console.error('审核失败:', error)
          message.error('审核失败')
        }
      }
    })
  }

  // 审核拒绝
  const handleReject = (record: Hotel) => {
    Modal.confirm({
      title: '审核拒绝',
      content: `确定要拒绝酒店「${record.name}」的审核吗？`,
      onOk: async () => {
        try {
          await rejectHotel(record.id)
          message.success('已拒绝')
          fetchAllHotels()
        } catch (error) {
          console.error('操作失败:', error)
          message.error('操作失败')
        }
      }
    })
  }

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿', badge: 'default' },
      PENDING: { color: 'processing', text: '待审核', badge: 'processing' },
      APPROVED: { color: 'success', text: '已通过', badge: 'success' },
      REJECTED: { color: 'error', text: '已拒绝', badge: 'error' }
    }
    const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  // 根据标签筛选数据
  const getFilteredHotels = () => {
    if (!hotels || hotels.length === 0) return []
    
    if (activeTab === 'all') return hotels
    if (activeTab === 'pending') return hotels.filter(h => h.status === 'PENDING')
    if (activeTab === 'approved') return hotels.filter(h => h.status === 'APPROVED')
    if (activeTab === 'draft') return hotels.filter(h => h.status === 'DRAFT')
    if (activeTab === 'rejected') return hotels.filter(h => h.status === 'REJECTED')
    return hotels
  }

  // 统计数量
  const getCount = (status?: string) => {
    if (!hotels) return 0
    if (!status) return hotels.length
    return hotels.filter(h => h.status === status).length
  }

  // 表格列定义
  const columns: ColumnsType<Hotel> = [
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
      width: 100,
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
      width: 100,
      render: (price: number) => `¥${price}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus
    },
    {
      title: '所属用户',
      dataIndex: 'ownerId',
      key: 'ownerId',
      width: 100,
      render: (ownerId: number) => `用户${ownerId}`
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: Hotel) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hotel/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/hotel/edit/${record.id}`)}
          >
            编辑
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                style={{ color: '#ff4d4f' }}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  // 计算当前筛选后的数据
  const filteredHotels = getFilteredHotels()
  console.log('当前筛选后的数据:', filteredHotels) // 添加调试日志

  return (
    <Card
      title={
        <Space>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/hotel')}
          >
            返回酒店列表
          </Button>
          <span>酒店审核管理</span>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={<Badge count={getCount()} offset={[10, 0]}>全部 ({getCount()})</Badge>} 
          key="all"
        />
        <TabPane 
          tab={<Badge count={getCount('PENDING')} offset={[10, 0]}>待审核 ({getCount('PENDING')})</Badge>} 
          key="pending"
        />
        <TabPane 
          tab={<Badge count={getCount('APPROVED')} offset={[10, 0]}>已通过 ({getCount('APPROVED')})</Badge>} 
          key="approved"
        />
        <TabPane 
          tab={<Badge count={getCount('DRAFT')} offset={[10, 0]}>草稿 ({getCount('DRAFT')})</Badge>} 
          key="draft"
        />
        <TabPane 
          tab={<Badge count={getCount('REJECTED')} offset={[10, 0]}>已拒绝 ({getCount('REJECTED')})</Badge>} 
          key="rejected"
        />
      </Tabs>

      <Table
        columns={columns}
        dataSource={filteredHotels}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        locale={{ emptyText: '暂无数据' }} // 添加空状态提示
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSize: 10,
        }}
      />
    </Card>
  )
}

export default AdminHotelList