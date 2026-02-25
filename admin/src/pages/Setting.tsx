import React from 'react'; 
import { Card, Tabs, Form, Button } from 'antd'; 
 
const Setting: React.FC = () => { 
  const items = [ 
    { 
      key: '1', 
      label: '基本设置', 
      children: ( 
        <Form layout="vertical" style={{ maxWidth: 600 }}> 
          <Form.Item label="系统名称" name="systemName"> 
          </Form.Item> 
          <Form.Item label="公司名称" name="companyName"> 
          </Form.Item> 
          <Form.Item label="联系电话" name="phone"> 
          </Form.Item> 
          <Form.Item> 
            <Button type="primary">保存设置</Button> 
          </Form.Item> 
        </Form> 
      ), 
    }, 
    { key: '2', label: '权限设置', children: <div>权限设置开发中...</div> }, 
    { key: '3', label: '通知设置', children: <div>通知设置开发中...</div> } 
  ]; 
 
  return ( 
    <Card title="系统设置"> 
      <Tabs defaultActiveKey="1" items={items} /> 
    </Card> 
  ); 
} 
 
export default Setting; 
