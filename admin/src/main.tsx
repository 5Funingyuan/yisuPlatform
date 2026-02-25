import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('main.tsx 执行了') // 添加这行看控制台是否有输出

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)