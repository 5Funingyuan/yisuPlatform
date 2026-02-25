## 易宿酒店平台服务端
基于 Node.js + Express + TypeORM + SQLite 开发的酒店管理平台后端服务。
## 技术栈
## 运行环境: Node.js 18+
## 框架: Express 4
## 语言: TypeScript
## ORM: TypeORM
## 数据库: SQLite
## 认证: JWT (jsonwebtoken)
## 密码加密: bcryptjs
## 数据验证: Zod
## 开发工具: tsx (TypeScript 执行器)
## 项目结构
text
server/
├── src/
│   ├── main.ts                 # 应用入口文件
│   ├── database/
│   │   └── connection.ts       # 数据库连接配置
│   ├── common/
│   │   ├── auth.middleware.ts  # JWT 认证中间件
│   │   ├── jwt.ts              # JWT 工具类
│   │   ├── response.ts         # 统一响应格式
│   │   ├── role.guard.ts       # 角色权限守卫
│   │   └── validation.ts       # Zod 验证规则
│   ├── modules/
│   │   ├── auth/               # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.model.ts
│   │   │   └── auth.dto.ts
│   │   ├── hotel/              # 酒店模块
│   │   │   ├── hotel.controller.ts
│   │   │   ├── hotel.service.ts
│   │   │   ├── hotel.model.ts
│   │   │   └── hotel.dto.ts
│   │   └── room/               # 房型模块
│   │   │   ├── room.controller.ts
│   │   │   ├── room.service.ts
│   │   │   ├── room.model.ts
│   │   │   └── room.dto.ts
│   └── ...
├── data/                       # SQLite 数据库文件
├── package.json
├── tsconfig.json
└── .env                        # 环境变量配置
## 快速开始
## 环境要求
Node.js 18+
npm 或 yarn
## 安装依赖
bash
# 进入 server 目录
cd server
# 安装依赖
npm install
# 或
yarn install
配置环境变量
创建 .env 文件：
env
# 服务器配置
PORT=3001
# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# 数据库配置
DATABASE_PATH=./data/yisu.db
开发环境运行
bash
# 开发模式（热重载）
npm run dev
# 或
yarn dev
服务将运行在 http://localhost:3001
生产环境构建
bash
# 编译 TypeScript
npm run build
# 启动生产服务
npm run start
## 核心功能模块
1. 用户认证模块
用户注册（默认角色为 USER）
用户登录（返回 JWT token）
获取当前用户信息
JWT 令牌验证
基于角色的权限控制
2. 酒店管理模块
创建酒店：酒店所有者创建新酒店（状态：草稿）
酒店列表：分页查询（支持城市、关键词、价格范围筛选）
酒店详情：查看酒店基本信息及房型列表
更新酒店：酒店所有者或管理员可更新
删除酒店：酒店所有者或管理员可删除
提交审核：酒店所有者提交酒店审核
审核通过/拒绝：管理员操作
发布/下线：酒店所有者控制酒店状态
3. 房型管理模块
创建房型：为酒店添加房型（需酒店已审核）
房型列表：获取酒店的所有可用房型
房型详情：查看房型信息
更新房型：酒店所有者或管理员可更新
删除房型：酒店所有者或管理员可删除
库存管理：管理员可调整库存
## 用户角色
## 普通用户 (USER)
注册/登录
创建酒店（初始状态：草稿）
查看自己创建的酒店（所有状态）
编辑/删除自己的酒店
为自己的酒店添加/编辑/删除房型
提交酒店审核
发布/下线自己的酒店
查看所有已审核通过的酒店
## 管理员 (ADMIN)
所有普通用户权限
查看所有酒店（包括未审核）
审核酒店（通过/拒绝）
管理所有酒店信息
管理所有房型信息
调整房型库存
## API 接口文档
基础信息
基础路径: /api
## 响应格式:
typescript
{
success: boolean;      // 是否成功
data?: any;            // 返回数据
message?: string;      // 提示信息
error?: string;        // 错误详情
}
认证方式: Bearer Token (在请求头中添加 Authorization: Bearer <token>)
认证接口 /api/auth
用户注册
POST /register
## 请求体:
json
{
"username": "string (3-50位)",
"password": "string (6-100位)"
}
## 响应:
json
{
"success": true,
"data": {
"token": "jwt_token",
"user": {
"id": 1,
"username": "testuser",
"role": "USER"
}
},
"message": "注册成功"
}
用户登录
POST /login
请求体:
json
{
"username": "string",
"password": "string"
}
响应:
json
{
"success": true,
"data": {
"token": "jwt_token",
"user": {
"id": 1,
"username": "testuser",
"role": "USER"
}
},
"message": "登录成功"
}
获取当前用户信息
GET /profile
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"data": {
"id": 1,
"username": "testuser",
"role": "USER",
"createdAt": "2024-01-01T00:00:00.000Z"
}
}
酒店接口 /api/hotels
获取酒店列表（公开）
GET /
查询参数:
city (可选): 城市筛选
keyword (可选): 关键词搜索（酒店名称）
minPrice (可选): 最低价格
maxPrice (可选): 最高价格
tags (可选): 标签（逗号分隔）
page (可选): 页码，默认 1
limit (可选): 每页数量，默认 10
响应:
json
{
"success": true,
"data": {
"items": [
{
"id": 1,
"name": "酒店名称",
"city": "北京",
"address": "详细地址",
"description": "酒店描述",
"star": "五星级",
"tags": ["商务", "亲子"],
"price": 599,
"promo": "限时优惠",
"status": "APPROVED",
"coverImage": "cover.jpg",
"intro": "简介",
"createdAt": "2024-01-01T00:00:00.000Z"
}
],
"total": 100,
"page": 1,
"limit": 10,
"totalPages": 10
}
}
获取我的酒店（需登录）
GET /my/list
请求头: Authorization: Bearer <token>
查询参数: 同获取酒店列表
响应: 同获取酒店列表（包含所有状态的酒店）
创建酒店（需登录）
POST /
请求头: Authorization: Bearer <token>
请求体:
json
{
"name": "酒店名称 (2-100位)",
"city": "城市 (1-50位)",
"address": "地址 (5-200位)",
"description": "描述 (可选)",
"star": "星级 (可选)",
"tags": ["标签", "数组", "可选"],
"price": 599,
"promo": "促销信息 (可选)",
"coverImage": "封面图 (可选)",
"intro": "简介 (可选)"
}
响应:
json
{
"success": true,
"data": {
"id": 1,
"name": "酒店名称",
"status": "DRAFT",
...
},
"message": "酒店创建成功"
}
获取酒店详情（公开）
GET /:id
响应:
json
{
"success": true,
"data": {
"id": 1,
"name": "酒店名称",
"city": "北京",
"address": "详细地址",
"description": "酒店描述",
"star": "五星级",
"tags": ["商务", "亲子"],
"price": 599,
"promo": "限时优惠",
"status": "APPROVED",
"coverImage": "cover.jpg",
"intro": "简介",
"createdAt": "2024-01-01T00:00:00.000Z",
"rooms": [
{
"id": 1,
"name": "豪华大床房",
"price": 599,
"stock": 10,
"status": "ON"
}
]
}
}
更新酒店（需登录，所有者或管理员）
PUT /:id
请求头: Authorization: Bearer <token>
请求体: 同创建酒店（所有字段可选）
响应:
json
{
"success": true,
"data": {
"id": 1,
"name": "更新后的酒店名称",
...
},
"message": "酒店更新成功"
}
删除酒店（需登录，所有者或管理员）
DELETE /:id
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "酒店删除成功"
}
提交审核（需登录，所有者）
POST /:id/submit
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "已提交审核"
}
发布酒店（需登录，所有者）
POST /:id/publish
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "酒店已发布"
}
下线酒店（需登录，所有者）
POST /:id/offline
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "酒店已下线"
}
管理员酒店接口 /api/admin/hotels（需管理员权限）
获取所有酒店（管理员）
GET /api/hotels（同公开接口，但返回所有状态）
请求头: Authorization: Bearer <token>
查询参数: 同获取酒店列表
审核通过
POST /:id/approve
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "酒店审核通过"
}
审核拒绝
POST /:id/reject
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "酒店审核已拒绝"
}
房型接口 /api
获取酒店房型列表
GET /hotels/:hotelId/rooms
响应:
json
{
"success": true,
"data": [
{
"id": 1,
"hotelId": 1,
"name": "豪华大床房",
"price": 599,
"stock": 10,
"description": "房间描述",
"facilities": ["WiFi", "空调", "电视"],
"status": "ON",
"createdAt": "2024-01-01T00:00:00.000Z"
}
]
}
创建房型（需登录，酒店所有者或管理员）
POST /hotels/:hotelId/rooms
请求头: Authorization: Bearer <token>
请求体:
json
{
"name": "房型名称 (2-100位)",
"price": 599,
"stock": 10,
"description": "描述 (可选)",
"facilities": ["WiFi", "空调"] (可选)
}
响应:
json
{
"success": true,
"data": {
"id": 1,
"name": "豪华大床房",
...
},
"message": "房型创建成功"
}
获取房型详情
GET /rooms/:id
响应:
json
{
"success": true,
"data": {
"id": 1,
"hotelId": 1,
"name": "豪华大床房",
"price": 599,
"stock": 10,
"description": "房间描述",
"facilities": ["WiFi", "空调", "电视"],
"status": "ON",
"createdAt": "2024-01-01T00:00:00.000Z"
}
}
更新房型（需登录，酒店所有者或管理员）
PUT /rooms/:id
请求头: Authorization: Bearer <token>
请求体:
json
{
"name": "更新后的房型名称",
"price": 699,
"stock": 8,
"description": "更新后的描述",
"facilities": ["WiFi", "空调", "浴缸"],
"status": "ON"
}
响应:
json
{
"success": true,
"data": {
"id": 1,
...
},
"message": "房型更新成功"
}
删除房型（需登录，酒店所有者或管理员）
DELETE /rooms/:id
请求头: Authorization: Bearer <token>
响应:
json
{
"success": true,
"message": "房型删除成功"
}
更新库存（管理员）
PATCH /rooms/:id/stock
请求头: Authorization: Bearer <token>
请求体:
json
{
"quantity": -1  // 正数增加库存，负数减少库存
}
响应:
json
{
"success": true,
"data": {
"stock": 9
},
"message": "库存更新成功"
}
## 数据模型
## 用户表 (users)
字段	        类型	    说明
id	            number	    主键
username	    string	    用户名（唯一）
password_hash	string	    加密密码
role	        string	    角色：USER/ADMIN
created_at	    datetime	创建时间
## 酒店表 (hotels)
字段	    类型	     说明
id	        number	    主键
name	    string	    酒店名称
city	    string	    城市
address	    string	    地址
description	text	    描述
star	    string	    星级
tags	    string[]	标签
price	    decimal	    参考价格
promo	    string	    促销信息
status	    string	    状态：DRAFT/PENDING/APPROVED/OFFLINE
owner_id	number	    所有者ID
cover_image	string	    封面图
intro	    string	    简介
created_at	datetime	创建时间
updated_at	datetime	更新时间
## 房型表 (rooms)
字段	    类型	    说明
id	        number	    主键
hotel_id	number	    所属酒店ID
name	    string	    房型名称
price	    decimal	    价格
stock	    number	    库存数量
description	text	    描述
facilities	string[]	设施列表
status	    string	    状态：ON/OFF
created_at	datetime	创建时间
updated_at	datetime	更新时间
## 测试数据
初始化管理员账号
首次启动时会自动创建管理员账号：
text
用户名：admin
密码：admin123
## 开发规范
代码风格
使用 TypeScript 严格模式
遵循 ESLint 规则
使用 async/await 处理异步
统一错误处理
使用 Zod 进行数据验证
响应格式规范
所有接口统一返回 ApiResponse 格式：
typescript
// 成功响应
{
success: true,
data: T,
message: "操作成功"
}
// 错误响应
{
success: false,
message: "错误提示",
error: "详细错误信息（可选）"
}
状态码规范
200: 成功
201: 创建成功
400: 请求参数错误
401: 未认证
403: 权限不足
404: 资源不存在
500: 服务器内部错误