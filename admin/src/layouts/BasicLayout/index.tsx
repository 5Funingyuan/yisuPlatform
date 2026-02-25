import React, { Suspense, useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  HomeOutlined,
  ShoppingOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  // 从 localStorage 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const isAdmin = userInfo.role === 'ADMIN'

  const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: 'hotel', icon: <HomeOutlined />, label: '酒店管理' },
  ...(isAdmin ? [{ key: 'admin/hotel', icon: <SettingOutlined />, label: '酒店审核' }] : []),
  { key: 'order', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: 'setting', icon: <SettingOutlined />, label: '设置' },
]


  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 清除登录状态
      localStorage.removeItem('token')
      navigate('/login')
    } else if (key === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? '14px' : '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? '易' : '易宿酒店平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{userInfo.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Suspense fallback={<div>加载中...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout