# 易宿酒店预订平台 yisuPlatform

一个基于 `pnpm workspace` 的三端项目，当前包含：

- `user`：用户端（Taro 4 + React 18，支持 H5 / 微信小程序）
- `admin`：管理后台（Vite + React + Ant Design）
- `server`：中间层 API 服务（Express + TypeScript）

## 当前架构（联调基线）

```text
user (H5/小程序)  ─┐
                    ├─> server (/api/*)
admin (Web)      ───┘
```

- `server` 是三端联调的唯一中间层。
- 当前线上可运行主实现是 `server/src/main.ts`（实体数据落盘 + 鉴权 + 酒店/房型/审核接口）。
- 用户端列表/详情 mock 已迁移到服务端消费链路：`/api/user/hotels*`。

## 技术栈

- Monorepo：`pnpm workspace`
- User：`Taro 4`、`React 18`、`Sass`、`Zustand`
- Admin：`Vite 5`、`React`、`TypeScript`、`Ant Design`
- Server：`Express`、`TypeScript`、`jsonwebtoken`、`bcryptjs`

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 快速开始

```bash
pnpm install
```

### 启动三端（推荐 3 个终端）

```bash
# 1) server (3001)
pnpm --filter yisu-platform-server dev

# 2) admin (3000)
pnpm dev:admin

# 3) user H5 (10087)
pnpm dev:user
```

默认访问地址：

- Admin: `http://localhost:3000`
- User H5: `http://localhost:10087`
- Server API: `http://localhost:3001`

## 微信小程序联调

```bash
# 默认本机调试（开发者工具）
pnpm dev:user:weapp

# 真机/局域网建议显式指定 server 地址
TARO_APP_WEAPP_DEV_API_BASE=http://<你的局域网IP>:3001/api pnpm dev:user:weapp
```

说明：

- H5 默认走 `/api` 代理到 `http://localhost:3001`。
- 小程序端可通过以下环境变量覆盖接口基址：
  - `TARO_APP_API_BASE`
  - `TARO_APP_WEAPP_DEV_API_BASE`

## 常用脚本（根目录）

```bash
pnpm dev:user
pnpm build:user
pnpm dev:user:weapp
pnpm build:user:weapp
pnpm dev:admin
pnpm build:admin
```

Server 子项目：

```bash
cd server
pnpm dev
pnpm build
pnpm start
pnpm sync:user-mock   # 将 user 端 mock 同步为 server/src/data/user-mock-data.json
pnpm seed:user-entities # 将 mock 导入实体数据源 server/src/data/runtime-entity-data.json
```

## 目录结构

```text
yisuPlatform/
├─ user/                         # 用户端（H5 + 微信小程序）
├─ admin/                        # 管理后台
├─ server/                       # API 服务
│  ├─ src/main.ts                # 当前运行主入口（实体数据落盘）
│  ├─ src/user-mock-service.ts   # 用户端列表/详情聚合逻辑
│  ├─ src/data/user-mock-data.json
│  └─ src/data/runtime-entity-data.json
├─ package.json
└─ pnpm-workspace.yaml
```

## 重要说明

- `server/src/modules/**` 中保留了早期 TypeORM 代码，但当前不在默认构建/运行路径中。
- 若需要切换到 TypeORM 方案，请先统一 ID、状态枚举和接口契约，再进行三端联调。
