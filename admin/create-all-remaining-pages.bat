@echo off
echo 开始创建所有缺失的页面文件...

REM 创建 Setting.tsx
echo import React from 'react'; > src\pages\Setting.tsx
echo import { Card, Tabs, Form, Input, Button, Switch } from 'antd'; >> src\pages\Setting.tsx
echo. >> src\pages\Setting.tsx
echo const Setting: React.FC = () =^> { >> src\pages\Setting.tsx
echo   const items = [ >> src\pages\Setting.tsx
echo     { >> src\pages\Setting.tsx
echo       key: '1', >> src\pages\Setting.tsx
echo       label: '基本设置', >> src\pages\Setting.tsx
echo       children: ( >> src\pages\Setting.tsx
echo         ^<Form layout="vertical" style={{ maxWidth: 600 }}^> >> src\pages\Setting.tsx
echo           ^<Form.Item label="系统名称" name="systemName"^> >> src\pages\Setting.tsx
echo             ^<Input placeholder="请输入系统名称" /^> >> src\pages\Setting.tsx
echo           ^</Form.Item^> >> src\pages\Setting.tsx
echo           ^<Form.Item label="公司名称" name="companyName"^> >> src\pages\Setting.tsx
echo             ^<Input placeholder="请输入公司名称" /^> >> src\pages\Setting.tsx
echo           ^</Form.Item^> >> src\pages\Setting.tsx
echo           ^<Form.Item label="联系电话" name="phone"^> >> src\pages\Setting.tsx
echo             ^<Input placeholder="请输入联系电话" /^> >> src\pages\Setting.tsx
echo           ^</Form.Item^> >> src\pages\Setting.tsx
echo           ^<Form.Item^> >> src\pages\Setting.tsx
echo             ^<Button type="primary"^>保存设置^</Button^> >> src\pages\Setting.tsx
echo           ^</Form.Item^> >> src\pages\Setting.tsx
echo         ^</Form^> >> src\pages\Setting.tsx
echo       ), >> src\pages\Setting.tsx
echo     }, >> src\pages\Setting.tsx
echo     { key: '2', label: '权限设置', children: ^<div^>权限设置开发中...^</div^> }, >> src\pages\Setting.tsx
echo     { key: '3', label: '通知设置', children: ^<div^>通知设置开发中...^</div^> } >> src\pages\Setting.tsx
echo   ]; >> src\pages\Setting.tsx
echo. >> src\pages\Setting.tsx
echo   return ( >> src\pages\Setting.tsx
echo     ^<Card title="系统设置"^> >> src\pages\Setting.tsx
echo       ^<Tabs defaultActiveKey="1" items={items} /^> >> src\pages\Setting.tsx
echo     ^</Card^> >> src\pages\Setting.tsx
echo   ); >> src\pages\Setting.tsx
echo } >> src\pages\Setting.tsx
echo. >> src\pages\Setting.tsx
echo export default Setting; >> src\pages\Setting.tsx

REM 创建 Login.tsx（如果还没有）
echo import React from 'react'; > src\pages\Login.tsx
echo import { Card, Form, Input, Button, Checkbox } from 'antd'; >> src\pages\Login.tsx
echo import { UserOutlined, LockOutlined } from '@ant-design/icons'; >> src\pages\Login.tsx
echo import { useNavigate } from 'react-router-dom'; >> src\pages\Login.tsx
echo. >> src\pages\Login.tsx
echo const Login: React.FC = () =^> { >> src\pages\Login.tsx
echo   const navigate = useNavigate(); >> src\pages\Login.tsx
echo   const onFinish = (values: any) =^> { >> src\pages\Login.tsx
echo     console.log('登录信息:', values); >> src\pages\Login.tsx
echo     navigate('/dashboard'); >> src\pages\Login.tsx
echo   }; >> src\pages\Login.tsx
echo   return ( >> src\pages\Login.tsx
echo     ^<div style={{ >> src\pages\Login.tsx
echo       height: '100vh', >> src\pages\Login.tsx
echo       display: 'flex', >> src\pages\Login.tsx
echo       justifyContent: 'center', >> src\pages\Login.tsx
echo       alignItems: 'center', >> src\pages\Login.tsx
echo       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' >> src\pages\Login.tsx
echo     }}^> >> src\pages\Login.tsx
echo       ^<Card title="易宿酒店管理后台" style={{ width: 400 }}^> >> src\pages\Login.tsx
echo         ^<Form name="login" onFinish={onFinish} size="large"^> >> src\pages\Login.tsx
echo           ^<Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}^> >> src\pages\Login.tsx
echo             ^<Input prefix={^<UserOutlined /^>} placeholder="用户名" /^> >> src\pages\Login.tsx
echo           ^</Form.Item^> >> src\pages\Login.tsx
echo           ^<Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}^> >> src\pages\Login.tsx
echo             ^<Input.Password prefix={^<LockOutlined /^>} placeholder="密码" /^> >> src\pages\Login.tsx
echo           ^</Form.Item^> >> src\pages\Login.tsx
echo           ^<Form.Item^> >> src\pages\Login.tsx
echo             ^<Button type="primary" htmlType="submit" style={{ width: '100%' }}^> >> src\pages\Login.tsx
echo               登录 >> src\pages\Login.tsx
echo             ^</Button^> >> src\pages\Login.tsx
echo           ^</Form.Item^> >> src\pages\Login.tsx
echo         ^</Form^> >> src\pages\Login.tsx
echo       ^</Card^> >> src\pages\Login.tsx
echo     ^</div^> >> src\pages\Login.tsx
echo   ); >> src\pages\Login.tsx
echo } >> src\pages\Login.tsx
echo export default Login; >> src\pages\Login.tsx

REM 创建 Order 页面
mkdir src\pages\Order 2>nul
echo import React from 'react'; > src\pages\Order\List.tsx
echo import { Card, Table } from 'antd'; >> src\pages\Order\List.tsx
echo. >> src\pages\Order\List.tsx
echo const OrderList: React.FC = () =^> { >> src\pages\Order\List.tsx
echo   const columns = [ >> src\pages\Order\List.tsx
echo     { title: '订单号', dataIndex: 'id', key: 'id' }, >> src\pages\Order\List.tsx
echo     { title: '酒店名称', dataIndex: 'hotelName', key: 'hotelName' }, >> src\pages\Order\List.tsx
echo     { title: '入住日期', dataIndex: 'checkIn', key: 'checkIn' }, >> src\pages\Order\List.tsx
echo     { title: '离店日期', dataIndex: 'checkOut', key: 'checkOut' }, >> src\pages\Order\List.tsx
echo     { title: '订单金额', dataIndex: 'amount', key: 'amount' }, >> src\pages\Order\List.tsx
echo     { title: '订单状态', dataIndex: 'status', key: 'status' }, >> src\pages\Order\List.tsx
echo   ]; >> src\pages\Order\List.tsx
echo   return ^<Card title="订单列表"^>^<Table columns={columns} dataSource={[]} /^>^</Card^>; >> src\pages\Order\List.tsx
echo } >> src\pages\Order\List.tsx
echo export default OrderList; >> src\pages\Order\List.tsx

echo import React from 'react'; > src\pages\Order\Detail.tsx
echo import { Card, Descriptions } from 'antd'; >> src\pages\Order\Detail.tsx
echo import { useParams } from 'react-router-dom'; >> src\pages\Order\Detail.tsx
echo. >> src\pages\Order\Detail.tsx
echo const OrderDetail: React.FC = () =^> { >> src\pages\Order\Detail.tsx
echo   const { id } = useParams(); >> src\pages\Order\Detail.tsx
echo   return ( >> src\pages\Order\Detail.tsx
echo     ^<Card title={`订单详情 - ${id}`}^> >> src\pages\Order\Detail.tsx
echo       ^<Descriptions bordered^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="订单号"^>{id}^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="酒店名称"^>上海希尔顿酒店^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="入住人"^>张三^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="联系电话"^>13800138000^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="入住日期"^>2024-01-01^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="离店日期"^>2024-01-03^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="房间数量"^>1间^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="订单金额"^>¥1299^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo         ^<Descriptions.Item label="订单状态"^>已支付^</Descriptions.Item^> >> src\pages\Order\Detail.tsx
echo       ^</Descriptions^> >> src\pages\Order\Detail.tsx
echo     ^</Card^> >> src\pages\Order\Detail.tsx
echo   ); >> src\pages\Order\Detail.tsx
echo } >> src\pages\Order\Detail.tsx
echo export default OrderDetail; >> src\pages\Order\Detail.tsx

REM 创建 Hotel 页面
mkdir src\pages\Hotel 2>nul
echo import React from 'react'; > src\pages\Hotel\List.tsx
echo import { Card, Table, Button, Space } from 'antd'; >> src\pages\Hotel\List.tsx
echo. >> src\pages\Hotel\List.tsx
echo const HotelList: React.FC = () =^> { >> src\pages\Hotel\List.tsx
echo   const columns = [ >> src\pages\Hotel\List.tsx
echo     { title: '酒店名称', dataIndex: 'name', key: 'name' }, >> src\pages\Hotel\List.tsx
echo     { title: '地址', dataIndex: 'address', key: 'address' }, >> src\pages\Hotel\List.tsx
echo     { title: '联系电话', dataIndex: 'phone', key: 'phone' }, >> src\pages\Hotel\List.tsx
echo     { title: '房间数量', dataIndex: 'roomCount', key: 'roomCount' }, >> src\pages\Hotel\List.tsx
echo   ]; >> src\pages\Hotel\List.tsx
echo   return ^<Card title="酒店列表"^>^<Table columns={columns} dataSource={[]} /^>^</Card^>; >> src\pages\Hotel\List.tsx
echo } >> src\pages\Hotel\List.tsx
echo export default HotelList; >> src\pages\Hotel\List.tsx

echo import React from 'react'; > src\pages\Hotel\Detail.tsx
echo import { Card, Descriptions, Tabs } from 'antd'; >> src\pages\Hotel\Detail.tsx
echo import { useParams } from 'react-router-dom'; >> src\pages\Hotel\Detail.tsx
echo. >> src\pages\Hotel\Detail.tsx
echo const HotelDetail: React.FC = () =^> { >> src\pages\Hotel\Detail.tsx
echo   const { id } = useParams(); >> src\pages\Hotel\Detail.tsx
echo   const items = [ >> src\pages\Hotel\Detail.tsx
echo     { key: '1', label: '基本信息', children: ^<div^>基本信息开发中...^</div^> }, >> src\pages\Hotel\Detail.tsx
echo     { key: '2', label: '房间类型', children: ^<div^>房间类型开发中...^</div^> }, >> src\pages\Hotel\Detail.tsx
echo     { key: '3', label: '图片管理', children: ^<div^>图片管理开发中...^</div^> }, >> src\pages\Hotel\Detail.tsx
echo   ]; >> src\pages\Hotel\Detail.tsx
echo   return ( >> src\pages\Hotel\Detail.tsx
echo     ^<Card title={`酒店详情 - ${id}`}^> >> src\pages\Hotel\Detail.tsx
echo       ^<Tabs defaultActiveKey="1" items={items} /^> >> src\pages\Hotel\Detail.tsx
echo     ^</Card^> >> src\pages\Hotel\Detail.tsx
echo   ); >> src\pages\Hotel\Detail.tsx
echo } >> src\pages\Hotel\Detail.tsx
echo export default HotelDetail; >> src\pages\Hotel\Detail.tsx

REM 创建 Dashboard
mkdir src\pages\Dashboard 2>nul
echo import React from 'react'; > src\pages\Dashboard\index.tsx
echo import { Card, Row, Col, Statistic } from 'antd'; >> src\pages\Dashboard\index.tsx
echo import { UserOutlined, ShoppingOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons'; >> src\pages\Dashboard\index.tsx
echo. >> src\pages\Dashboard\index.tsx
echo const Dashboard: React.FC = () =^> { >> src\pages\Dashboard\index.tsx
echo   return ( >> src\pages\Dashboard\index.tsx
echo     ^<div^> >> src\pages\Dashboard\index.tsx
echo       ^<Row gutter={16}^> >> src\pages\Dashboard\index.tsx
echo         ^<Col span={6}^>^<Card^>^<Statistic title="酒店总数" value={112} prefix={^<HomeOutlined /^>} /^>^</Card^>^</Col^> >> src\pages\Dashboard\index.tsx
echo         ^<Col span={6}^>^<Card^>^<Statistic title="今日订单" value={93} prefix={^<ShoppingOutlined /^>} /^>^</Card^>^</Col^> >> src\pages\Dashboard\index.tsx
echo         ^<Col span={6}^>^<Card^>^<Statistic title="入住人数" value={112} prefix={^<UserOutlined /^>} /^>^</Card^>^</Col^> >> src\pages\Dashboard\index.tsx
echo         ^<Col span={6}^>^<Card^>^<Statistic title="今日营收" value={11280} prefix={^<DollarOutlined /^>} /^>^</Card^>^</Col^> >> src\pages\Dashboard\index.tsx
echo       ^</Row^> >> src\pages\Dashboard\index.tsx
echo     ^</div^> >> src\pages\Dashboard\index.tsx
echo   ); >> src\pages\Dashboard\index.tsx
echo } >> src\pages\Dashboard\index.tsx
echo export default Dashboard; >> src\pages\Dashboard\index.tsx

echo 所有页面文件创建完成！
pause