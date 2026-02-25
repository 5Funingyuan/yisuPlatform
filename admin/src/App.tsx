import { Suspense } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter } from 'react-router-dom'
import Router from './router'
import './styles/global.less'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>}>
          <Router />
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
