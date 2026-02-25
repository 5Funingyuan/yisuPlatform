import React, { useState } from 'react'
import { Card, Form, Input, Button, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login, register, LoginParams } from '@/api/auth'

const { TabPane } = Tabs

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  // 处理登录
  const handleLogin = async (values: LoginParams) => {
    console.log('登录尝试:', values)
    setLoading(true)
    
    try {
      const res = await login(values)
      localStorage.setItem('token', res.token)
      localStorage.setItem('userInfo', JSON.stringify(res.user))
      message.success('登录成功！')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('登录失败:', error)
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理注册
  const handleRegister = async (values: any) => {
    console.log('注册尝试:', values)
    setLoading(true)
    
    try {
      const res = await register({
        username: values.username,
        password: values.password
      })
      console.log('注册响应:', res)
      message.success('注册成功！请登录')
      setActiveTab('login')
      loginForm.setFieldsValue({
        username: values.username,
        password: values.password
      })
    } catch (error: any) {
      console.error('注册失败:', error)
      message.error(error.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0B2A4A 0%, #1B4A6F 100%)' // 深蓝色渐变
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 20%)',
        pointerEvents: 'none'
      }} />
      
      {/* 左侧品牌展示 */}
      <div style={{
        position: 'absolute',
        left: '10%',
        color: 'white',
        maxWidth: 400
      }}>
        <HomeOutlined style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }} />
        <h1 style={{ color: 'white', fontSize: 36, marginBottom: 8 }}>易宿酒店</h1>
        <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.8 }}>
          让您的旅途更轻松<br />
          智能酒店预订平台，为您提供优质住宿体验
        </p>
      </div>

      {/* 登录卡片 */}
      <Card 
        style={{ 
          width: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 8,
          marginLeft: 'auto',
          marginRight: '15%'
        }}
      >
        {/* 移动端标题（小屏幕显示） */}
        <div style={{ textAlign: 'center', marginBottom: 24, display: 'none' }}>
          <HomeOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
          <h2 style={{ margin: 0 }}>易宿酒店</h2>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="登录" key="login">
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="用户名" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%', height: 40 }}
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="注册" key="register">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="用户名" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="密码" 
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="确认密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%', height: 40 }}
                  loading={loading}
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        {/* 底部文字 */}
        <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
          {activeTab === 'login' ? (
            <span>还没有账号？ <Button type="link" onClick={() => setActiveTab('register')}>立即注册</Button></span>
          ) : (
            <span>已有账号？ <Button type="link" onClick={() => setActiveTab('login')}>立即登录</Button></span>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Login