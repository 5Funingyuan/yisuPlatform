import type { PropsWithChildren } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './app.scss'

function App(props: PropsWithChildren) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        cssVar: true,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
          colorBgLayout: '#f2f4f7',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <AntdApp>{props.children}</AntdApp>
    </ConfigProvider>
  )
}

export default App
