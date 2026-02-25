import React, { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Select,
  InputNumber,
  message,
  Upload
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { createHotel, updateHotel, getHotelDetail, Hotel } from '@/api/hotel'

const { TextArea } = Input
const { Option } = Select

// 城市选项
const cityOptions = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安',
  '三亚', '厦门', '青岛', '南京', '武汉', '长沙', '天津', '苏州'
]

// 星级选项
const starOptions = [
  '经济型', '舒适型', '高档型', '豪华型', '五星级'
]

// 标签选项
const tagOptions = [
  '近地铁', '含早餐', '免费取消', '海景', '亲子', '免费停车', '健身房', '游泳池'
]

const HotelForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isEditing = !!id

  useEffect(() => {
    if (isEditing) {
      fetchHotelDetail()
    }
  }, [id])

  // 获取酒店详情（编辑时）
  const fetchHotelDetail = async () => {
    setLoading(true)
    try {
      const res = await getHotelDetail(id!)
      console.log('获取酒店详情:', res)
      
      // 根据实际返回格式设置表单
      if (res && res.data) {
        form.setFieldsValue(res.data)
      } else {
        form.setFieldsValue(res as Hotel)
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      message.error('获取酒店详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 提交表单
  // 提交表单
  const onFinish = async (values: any) => {
    console.log('表单提交值:', values)
    setSubmitting(true)
  
    try {
      let res
      if (isEditing) {
        // 更新酒店
        res = await updateHotel(id!, values)
        message.success('酒店更新成功！')
      } else {
        // 🔴 创建酒店时，添加 status 字段为 'PENDING'
        const submitData = {
          ...values,
          status: 'PENDING'  // 直接设为待审核状态
        }
        console.log('提交数据:', submitData)
      
        res = await createHotel(submitData)
        message.success('酒店创建成功！已提交审核')
      }
    
      console.log('提交结果:', res)
    
      // 跳转到酒店列表页
      navigate('/hotel')
    } catch (error: any) {
      console.error('提交失败:', error)
      message.error(error.response?.data?.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
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
          {isEditing ? '编辑酒店' : '新增酒店'}
        </Space>
      }
      loading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800 }}
        initialValues={{
          tags: [],
          price: 0,
          star: '舒适型'
        }}
      >
        {/* 基本信息 */}
        <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="酒店名称"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="例如：易宿臻选酒店（深圳会展中心店）" />
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select
              showSearch
              placeholder="请选择城市"
              optionFilterProp="children"
            >
              {cityOptions.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="例如：深圳市福田区福华三路 88 号" />
          </Form.Item>

          <Form.Item
            name="star"
            label="酒店星级"
          >
            <Select placeholder="请选择星级">
              {starOptions.map(star => (
                <Option key={star} value={star}>{star}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="酒店标签"
          >
            <Select
              mode="multiple"
              placeholder="请选择标签"
              options={tagOptions.map(tag => ({ label: tag, value: tag }))}
            />
          </Form.Item>
        </Card>

        {/* 价格信息 */}
        <Card type="inner" title="价格信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="price"
            label="起价（元/晚）"
            rules={[{ required: true, message: '请输入起价' }]}
          >
            <InputNumber
              min={0}
              step={10}
              style={{ width: '100%' }}
              placeholder="请输入起价"
            />
          </Form.Item>

          <Form.Item
            name="promo"
            label="促销信息"
          >
            <Input placeholder="例如：会展差旅专属礼遇，连住 2 晚 95 折" />
          </Form.Item>
        </Card>

        {/* 介绍信息 */}
        <Card type="inner" title="介绍信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="intro"
            label="简短介绍"
          >
            <Input placeholder="例如：步行可达会展中心，商务出行便捷" />
          </Form.Item>

          <Form.Item
            name="description"
            label="详细描述"
          >
            <TextArea
              rows={4}
              placeholder="请输入酒店的详细描述"
            />
          </Form.Item>
        </Card>

        {/* 图片信息 */}
        <Card type="inner" title="图片信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="coverImage"
            label="封面图片URL"
          >
            <Input placeholder="请输入图片URL地址" />
          </Form.Item>

          {/* 如果需要上传功能，可以添加 Upload 组件 */}
          <Form.Item label="上传图片">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={{ showRemoveIcon: true }}
              beforeUpload={() => false} // 阻止自动上传
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        </Card>

        {/* 提交按钮 */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {isEditing ? '保存修改' : '创建酒店'}
            </Button>
            <Button onClick={() => navigate('/hotel')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default HotelForm