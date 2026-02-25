# 易宿平台 yisuPlatform

一个基于 `pnpm workspace` 的酒店预订项目，当前包含：

- `user`：移动端用户应用（Taro 4 + React 18）
- `server`：Node.js/Express 接口服务（开发态内存数据）

当前开发重点在移动端 C 端流程：酒店查询页 -> 酒店列表页 -> 酒店详情页。

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

## 接口与数据说明

当前用户端页面为“前端优先”开发模式：

- 列表页、详情页主数据主要来自本地 mock（`user/src/pages/**/mock.ts`）
- `user/src/services/*` 提供异步调用形态，便于后续无缝替换为真实后端 API

即：页面交互流程完整，可演示；真实生产数据联调仍需继续接入后端。

## 已知注意事项

- 若微信开发者工具报 “根据 miniprogramRoot 找不到 app.json”：
  - 检查导入目录是否为 `user`
  - 检查 `user/project.config.json` 的 `miniprogramRoot` 是否为 `dist/weapp/`
- H5 与小程序存在平台渲染差异，列表页已做移动端尺寸策略以尽量对齐视觉效果

## 后续建议

- 将 `user/src/services` 从 mock 切换到真实 API
- 补齐登录态、下单链路、异常监控
- 增加单元测试与端到端回归流程
