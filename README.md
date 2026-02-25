# 易宿酒店预订平台 yisuPlatform

一个基于 `pnpm workspace` 和 `taro` 的多端酒店预订项目：

- `user`：移动端用户应用（Taro 4 + React 18）
- `server`：Node.js/Express 接口服务

## 页面概览

![h5端酒店查询页]<img width="366" height="558" alt="Image" src="https://github.com/user-attachments/assets/33a5c76d-7091-4ade-8373-19352762cf43" />
![h5端酒店列表页]<img width="370" height="660" alt="Image" src="https://github.com/user-attachments/assets/3f829b16-b485-4051-8282-4fbfe6cc7952" />
![h5端酒店详情页]<img width="490" height="911" alt="Image" src="https://github.com/user-attachments/assets/ea663d78-6460-44bf-a0a5-f822b9185185" />
![微信小程序端酒店查询页]<img width="492" height="961" alt="Image" src="https://github.com/user-attachments/assets/eb4c2b6e-df77-4425-bc5d-f2368110f3cb" />

## 功能概览

### 用户端（`user`）

- 酒店查询页
  - 顶部 Banner 轮播
  - 城市、定位、关键词、入住离店日期、筛选入口
  - 自研日历组件（跨 H5 / 小程序）
  - 查询跳转酒店列表页
- 酒店列表页
  - 顶部条件摘要、排序区、快捷筛选区
  - 酒店卡片列表
  - 上滑自动加载更多
  - 390x844 机型视觉增强模式（H5 + 小程序兼容逻辑）
- 酒店详情页
  - 顶部导航、图片轮播、基础信息
  - 日历/间夜信息、房型价格列表
  - 房型按价格排序展示

### 服务端（`server`）

- 用户认证：注册、登录、个人信息
- 酒店接口：列表、详情、创建
- 房型接口：列表、创建
- 管理员接口：酒店审核相关

## 技术栈

- Monorepo: `pnpm workspace`
- User:
  - `Taro 4`
  - `React 18`
  - `Sass`
  - `Zustand`
- Server:
  - `Express`
  - `jsonwebtoken`
  - `bcryptjs`
  - `TypeScript`

## 目录结构

```text
yisuPlatform/
├─ user/                         # 移动端（H5 + 微信小程序）
│  ├─ src/
│  │  ├─ pages/query/            # 酒店查询页
│  │  ├─ pages/list/             # 酒店列表页
│  │  ├─ pages/detail/           # 酒店详情页
│  │  └─ pages/filter/           # 筛选页
│  ├─ config/                    # taro 构建配置
│  ├─ project.config.json        # 微信开发者工具配置
│  └─ package.json
├─ server/                       # Node.js API 服务
│  ├─ src/
│  └─ package.json
├─ package.json                  # workspace 根命令
└─ pnpm-workspace.yaml
```

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 快速开始

```bash
# 1) 安装依赖
pnpm install
```

### 启动 H5（用户端）

```bash
# 开发模式（watch）
pnpm dev:user

# 生产构建
pnpm build:user
```

默认本地端口（开发态）：

- `http://localhost:10087`

局域网手机预览：

- 保持电脑和手机在同一 Wi-Fi
- 访问终端输出的 `On Your Network` 地址（例如 `http://192.168.x.x:10087`）

### 启动微信小程序（用户端）

```bash
# 开发模式（watch）
pnpm dev:user:weapp

# 生产构建
pnpm build:user:weapp
```

然后在微信开发者工具中：

1. 导入目录：`yisuPlatform/user`
2. 使用 `user/project.config.json`
3. 确认 `miniprogramRoot` 为 `dist/weapp/`

### 启动服务端

```bash
# 方式一：在根目录通过 filter 运行
pnpm --filter yisu-platform-server dev

# 方式二：进入 server 目录运行
cd server
pnpm dev
```

默认地址：

- `http://localhost:3001`
- 健康检查：`GET /health`

## 常用脚本（根目录）

```bash
pnpm dev:user            # user H5 watch
pnpm build:user          # user H5 build
pnpm dev:user:weapp      # user 微信小程序 watch
pnpm build:user:weapp    # user 微信小程序 build
```
