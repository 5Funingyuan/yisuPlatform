## `admin/README.md`

```markdown
# 易宿酒店 PC 管理端

基于 React + TypeScript + Vite + Ant Design 开发的酒店管理后台系统。

## 🏗️ 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5
- **路由**: React Router 6
- **HTTP 请求**: Axios
- **状态管理**: MobX
- **样式**: Less

## 📁 项目结构

```
admin/
├── src/
│   ├── api/              # API 接口定义
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── hotel.ts      # 酒店相关接口
│   │   ├── order.ts      # 订单相关接口
│   │   └── room.ts       # 房型相关接口
│   ├── components/       # 公共组件
│   ├── layouts/          # 布局组件
│   │   └── BasicLayout/  # 基础布局
│   ├── pages/            # 页面组件
│   │   ├── Dashboard/    # 仪表盘
│   │   ├── Hotel/        # 酒店管理
│   │   │   ├── List.tsx  # 酒店列表
│   │   │   ├── Detail.tsx # 酒店详情
│   │   │   ├── Form.tsx  # 新增/编辑酒店
│   │   │   └── AdminList.tsx # 管理员审核列表
│   │   ├── Order/        # 订单管理
│   │   └── Login.tsx     # 登录/注册
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── App.tsx           # 根组件
│   └── main.tsx          # 入口文件
├── public/               # 静态资源
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- pnpm 7+ (推荐) 或 npm

### 安装依赖

```bash
# 进入 admin 目录
cd admin

# 安装依赖
pnpm install
# 或
npm install
```

### 开发环境运行

```bash
pnpm dev
# 或
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
pnpm build
# 或
npm run build
```

构建后的文件在 `dist` 目录。

## 🔧 配置说明

### 代理配置

在 `vite.config.ts` 中配置后端 API 代理：

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001', // 后端地址
      changeOrigin: true,
    }
  }
}
```

## 📦 主要功能模块

### 1. 用户认证

- 登录/注册功能
- JWT token 认证
- 路由守卫
- 角色权限控制

### 2. 酒店管理

- **酒店列表**：查看所有已审核酒店
- **我的酒店**：查看自己创建的酒店（所有状态）
- **酒店详情**：查看酒店基本信息
- **新增酒店**：创建新酒店（自动提交审核）
- **编辑酒店**：修改酒店信息
- **房型管理**：添加/编辑/删除房型

### 3. 管理员功能

- **酒店审核**：查看所有酒店（按状态筛选）
- **审核通过**：将待审核酒店设为已通过
- **审核拒绝**：将待审核酒店设为已拒绝

### 4. 订单管理（待开发）

- 订单列表
- 订单详情
- 订单状态更新

## 👥 用户角色

### 普通用户（酒店老板）
- 创建酒店（自动进入待审核状态）
- 查看自己创建的所有酒店
- 管理自己酒店的房型
- 查看已审核通过的酒店

### 管理员
- 所有普通用户权限
- 查看所有酒店（包括未审核）
- 审核酒店（通过/拒绝）
- 管理所有酒店信息

## 🔗 接口文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| GET | `/api/auth/profile` | 获取当前用户信息 |

### 酒店接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/hotels` | 获取所有已审核酒店 |
| GET | `/api/hotels/:id` | 获取酒店详情 |
| POST | `/api/hotels` | 创建酒店 |
| PUT | `/api/hotels/:id` | 更新酒店 |
| GET | `/api/hotels/my/list` | 获取我的酒店 |
| POST | `/api/hotels/:id/submit` | 提交审核 |

### 管理员接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/hotels` | 获取所有酒店 |
| POST | `/api/admin/hotels/:id/approve` | 审核通过 |
| POST | `/api/admin/hotels/:id/reject` | 审核拒绝 |

### 房型接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/hotels/:id/rooms` | 获取酒店房型 |
| POST | `/api/hotels/:id/rooms` | 创建房型 |
| PUT | `/api/rooms/:id` | 更新房型 |
| DELETE | `/api/rooms/:id` | 删除房型 |

## 🧪 测试账号

### 管理员账号
```
用户名：admin
密码：admin123
```

### 普通用户账号（需注册）
```
用户名：自定义
密码：自定义
```

## 📝 开发规范

### 代码风格

- 使用 ESLint + Prettier
- 函数组件 + Hooks
- TypeScript 严格模式

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具链
```

## 🐛 常见问题

### Q: 登录失败怎么办？
A: 检查后端是否启动，确认用户名密码正确。

### Q: 创建酒店后看不到？
A: 酒店需要管理员审核通过后才会在"所有酒店"显示，可以在"我的酒店"查看状态。

### Q: 403 错误？
A: 权限不足，确认是否用对账号登录。

## 📄 许可证

MIT
```

## 根目录 README 更新

你也可以在项目根目录的 `README.md` 中添加 PC 管理端的说明：

```markdown
# 易宿酒店预订平台

基于 pnpm workspace 的 monorepo 项目。

## 项目结构

- **user/** - 移动端（Taro + React）
- **admin/** - PC 管理端（React + Ant Design） 👈
- **server/** - 后端服务（Node.js + Express）

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动 PC 管理端

```bash
pnpm dev:admin
```

### 启动移动端

```bash
pnpm dev:user
```

### 启动后端

```bash
cd server
node main.ts
```

## PC 管理端功能

- 酒店管理（创建、编辑、审核）
- 房型管理
- 订单管理（开发中）
- 用户认证（登录/注册）
- 角色权限控制

