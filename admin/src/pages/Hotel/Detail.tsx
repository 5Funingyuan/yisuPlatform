import React, { useEffect, useState } from 'react'
import { 
  Card, Descriptions, Tabs, Button, Space, Tag, 
  message, Modal, Table, Popconfirm, Input, Select,
  Form, InputNumber
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { getHotelDetail, updateHotel, submitHotelForReview, Hotel, HotelStatus } from '@/api/hotel'
import { getRoomsByHotel, createRoom, updateRoom, deleteRoom, Room, CreateRoomParams } from '@/api/room'

const { TabPane } = Tabs
const { Option } = Select


const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null)
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false)
  const [roomForm] = Form.useForm()

  const hotelId = id || ''
  
  console.log('路由参数 id:', id)
  console.log('酒店 ID:', hotelId)

  useEffect(() => {
    console.log('useEffect 触发, hotelId:', hotelId)
    if (hotelId) {
      console.log('开始获取数据, hotelId:', hotelId)
      fetchHotelDetail()
      fetchRooms()
    } else {
      console.error('无效的酒店ID:', id)
      message.error('无效的酒店ID')
    }
  }, [hotelId])

  // 获取酒店详情
  const fetchHotelDetail = async () => {
    console.log('执行 fetchHotelDetail, hotelId:', hotelId)
    setLoading(true)
    try {
      console.log('调用 getHotelDetail API...')
      const res = await getHotelDetail(hotelId)  // 直接传字符串
      console.log('getHotelDetail 返回结果:', res)
      
      if (res) {
        // 根据实际返回格式处理
        if (res.data) {
          console.log('设置酒店数据 (res.data):', res.data)
          setHotel(res.data)
        } else {
          console.log('设置酒店数据 (直接):', res)
          setHotel(res as Hotel)
        }
      } else {
        console.error('返回结果为空')
        message.error('获取酒店详情失败：返回数据为空')
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      message.error('获取酒店详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取房间列表
  const fetchRooms = async () => {
    console.log('执行 fetchRooms, hotelId:', hotelId)
    try {
      console.log('调用 getRoomsByHotel API...')
      const res = await getRoomsByHotel(hotelId)  // 直接传字符串
      console.log('getRoomsByHotel 返回结果:', res)
      
      if (Array.isArray(res)) {
        console.log('设置房间列表 (数组):', res)
        setRooms(res)
      } else if (res && res.data) {
        console.log('设置房间列表 (res.data):', res.data)
        setRooms(res.data)
      } else {
        console.log('设置房间列表 (空数组)')
        setRooms([])
      }
    } catch (error) {
      console.error('获取房间列表失败:', error)
      setRooms([])
    }
  }
  // 提交审核
  const handleSubmitReview = async () => {
  Modal.confirm({
    title: '提交审核',
    content: '提交审核后，酒店将进入待审核状态，管理员审核通过后即可在前台展示。确定提交吗？',
    onOk: async () => {
      try {
        await submitHotelForReview(hotelId)
        message.success('已提交审核，请等待管理员审核')
        fetchHotelDetail() // 刷新详情
      } catch (error) {
        console.error('提交审核失败:', error)
        message.error('提交审核失败')
      }
    }
  })
}

  // 获取状态标签
  const getStatusTag = (status: HotelStatus) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      PENDING: { color: 'processing', text: '待审核' },
      APPROVED: { color: 'success', text: '已通过' },
      REJECTED: { color: 'error', text: '已拒绝' }
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  // 房间表格列
  const roomColumns = [
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}/晚`
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => `${stock}间`
    },
    {
      title: '设施',
      dataIndex: 'facilities',
      key: 'facilities',
      render: (facilities: string[]) => (
        <Space size={[0, 4]} wrap>
          {facilities?.map(f => <Tag key={f}>{f}</Tag>)}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ON' ? 'green' : 'red'}>
          {status === 'ON' ? '上架' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Room) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditRoom(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个房型吗？"
            onConfirm={() => handleDeleteRoom(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 处理编辑房间
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    roomForm.setFieldsValue(room)
    setIsRoomModalVisible(true)
  }

  // 处理新增房间
  const handleAddRoom = () => {
    setEditingRoom(null)
    roomForm.resetFields()
    setIsRoomModalVisible(true)
  }

  // 保存房间
  const handleSaveRoom = async () => {
    try {
      const values = await roomForm.validateFields()
      
      if (editingRoom?.id) {
        // 更新
        await updateRoom(editingRoom.id, values)
        message.success('房型更新成功')
      } else {
        // 新增
        await createRoom(hotelId, values)
        message.success('房型创建成功')
      }
      
      setIsRoomModalVisible(false)
      fetchRooms()
    } catch (error) {
      console.error('保存房型失败:', error)
    }
  }

  // 删除房间
  const handleDeleteRoom = async (roomId: number) => {
    try {
      await deleteRoom(roomId)
      message.success('删除成功')
      fetchRooms()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  if (!hotel) {
    return <Card loading={loading}>加载中...</Card>
  }

  return (
    <Card
      title={
        <Space>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/hotel')}
          >
            返回
          </Button>
          酒店详情
        </Space>
      }
      extra={
        <Space>
          {hotel.status === 'DRAFT' && (
            <Button type="primary" onClick={handleSubmitReview}>
              提交审核
            </Button>
          )}
          {hotel.status === 'APPROVED' && (
            <Button>发布酒店</Button>
          )}
          <Button 
      icon={<EditOutlined />}
      onClick={() => navigate(`/hotel/edit/${hotel.id}`)}>
            编辑基本信息
          </Button>
        </Space>
      }
      loading={loading}
    >
      <Descriptions title="基本信息" bordered column={2}>
        <Descriptions.Item label="酒店名称" span={2}>
          {hotel.name} {getStatusTag(hotel.status)}
        </Descriptions.Item>
        <Descriptions.Item label="城市">{hotel.city}</Descriptions.Item>
        <Descriptions.Item label="星级">{hotel.star || '未设置'}</Descriptions.Item>
        <Descriptions.Item label="地址" span={2}>{hotel.address}</Descriptions.Item>
        <Descriptions.Item label="联系电话" span={2}>{hotel.tags?.join(' ')}</Descriptions.Item>
        <Descriptions.Item label="简介" span={2}>{hotel.intro || '暂无简介'}</Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>{hotel.description || '暂无描述'}</Descriptions.Item>
        <Descriptions.Item label="标签" span={2}>
          <Space>
            {hotel.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="起价">¥{hotel.price}</Descriptions.Item>
        <Descriptions.Item label="促销信息">{hotel.promo || '无'}</Descriptions.Item>
      </Descriptions>

      <Card 
        title="房型管理" 
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>
            新增房型
          </Button>
        }
      >
        <Table 
          columns={roomColumns} 
          dataSource={rooms} 
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 房型编辑弹窗 */}
      <Modal
        title={editingRoom ? '编辑房型' : '新增房型'}
        open={isRoomModalVisible}
        onOk={handleSaveRoom}
        onCancel={() => setIsRoomModalVisible(false)}
        width={600}
      >
        <Form
          form={roomForm}
          layout="vertical"
          initialValues={{ status: 'ON', facilities: [] }}
        >
          <Form.Item
            name="name"
            label="房型名称"
            rules={[{ required: true, message: '请输入房型名称' }]}
          >
            <Input placeholder="例如：豪华大床房" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格（元/晚）"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存（房间数量）"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="facilities"
            label="设施"
          >
            <Select mode="tags" placeholder="输入设施后回车">
              <Option value="空调">空调</Option>
              <Option value="电视">电视</Option>
              <Option value="免费WiFi">免费WiFi</Option>
              <Option value="迷你吧">迷你吧</Option>
              <Option value="浴缸">浴缸</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="房型描述"
          >
            <Input.TextArea rows={3} placeholder="请输入房型描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="ON">上架</Option>
              <Option value="OFF">下架</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default HotelDetail