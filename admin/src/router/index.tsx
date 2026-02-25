import React, { lazy } from 'react'
import { useRoutes, Navigate } from 'react-router-dom'
import BasicLayout from '../layouts/BasicLayout'  // 修改这里，不使用 @/

// 懒加载页面组件 - 修正所有路径
const Dashboard = lazy(() => import('../pages/Dashboard/index'))  // 修正路径
const HotelList = lazy(() => import('../pages/Hotel/List'))        // 修正路径
const HotelDetail = lazy(() => import('../pages/Hotel/Detail'))    // 修正路径
const HotelForm = lazy(() => import( '../pages/Hotel/Form' )) // 新增
const OrderList = lazy(() => import('../pages/Order/List'))        // 修正路径
const OrderDetail = lazy(() => import('../pages/Order/Detail'))    // 修正路径
const Login = lazy(() => import('../pages/Login'))                 // 修正路径
const Setting = lazy(() => import('../pages/Setting'))             // 修正路径
const AdminHotelList = lazy(() => import('../pages/Hotel/AdminList'))             // 修正路径


const Router: React.FC = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <BasicLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        {
          path: 'hotel',
          children: [
            { index: true, element: <HotelList /> },
            { path: 'add', element: <HotelForm /> },           // 新增酒店
            { path: 'edit/:id', element: <HotelForm /> },      // 编辑酒店
            { path: ':id', element: <HotelDetail /> }
          ]
        },
        {
          path: 'order',
          children: [
            { index: true, element: <OrderList /> },
            { path: ':id', element: <OrderDetail /> }
          ]
        },
        { path: 'setting', element: <Setting /> }
      ]
    },
    { path: '/login', element: <Login /> },
    {
      path: 'admin',
      children: [
        { path: 'hotel', element: <AdminHotelList /> },
      ]
   }
  ])

  return element
}

export default Router