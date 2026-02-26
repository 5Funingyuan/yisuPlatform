# 易宿酒店预订平台（yisuPlatform）

一个基于 `pnpm workspace` 的三端协同项目，覆盖：

- `user`：用户端（`Taro 4 + React 18`，支持 H5 / 微信小程序）
- `admin`：管理后台（`Vite + React + TypeScript + Ant Design`）
- `server`：中间层 API（`Express + TypeScript`）


---

## 1. 项目目标与价值

易宿平台不是单一前端或后端项目，而是一个完整的多端酒店业务协同系统，目标是打通：

1. **用户侧预订决策链路**：搜索 -> 筛选 -> 看详情 -> 选房型 -> 价格刷新与下单意图沉淀
2. **商家侧经营链路**：酒店创建/编辑 -> 房型管理 -> 提审 -> 上下线
3. **平台侧治理链路**：管理员审核、状态流转、统一数据视图

核心设计强调：**同源数据、多端消费、最小联调成本、快速迭代可落地**。

---

## 2. 总体架构

```text
user (H5 / WeApp)  ─┐
                    ├──> server (/api/*) ───> runtime-entity-data.json
admin (Web)       ──┘
```

- `server` 作为三端唯一中间层，统一认证、权限、状态流转与数据聚合。
- `user` 与 `admin` 通过统一接口契约访问服务端，避免端侧直连“数据文件/数据库”。
- 通过脚本把用户端 mock 能力同步/导入到服务端实体数据，保证联调时“看见的就是可管理的”。

---

## 3. 技术栈总结

### 3.1 工程与构建

| 维度 | 选型 | 作用 |
| --- | --- | --- |
| Monorepo | `pnpm workspace` | 统一管理三端依赖与脚本，降低跨端协作成本 |
| 包管理 | `pnpm` | 去重安装、加速依赖管理 |
| 前端构建 | `Vite`（admin）/ `Taro CLI`（user） | Web 快速热更新 + 多端编译 |
| 服务端构建 | `tsx watch` + `tsc` | 开发热更新与生产构建分离 |

### 3.2 端侧技术

| 子项目 | 关键技术 | 说明 |
| --- | --- | --- |
| `user` | `Taro 4`、`React 18`、`Sass`、`Zustand` | 一套业务代码覆盖 H5 / 微信小程序；状态持久化与多页共享 |
| `admin` | `React 18`、`TypeScript`、`Ant Design 5`、`Axios` | 面向运营与审核场景的后台能力 |
| `server` | `Express 4`、`TypeScript`、`jsonwebtoken`、`bcryptjs` | 认证鉴权、酒店/房型/审核接口、用户端聚合接口 |

### 3.3 质量与规范基础

- `admin` 与 `server` 启用 TypeScript `strict` 级别配置（见各自 `tsconfig`）。
- `admin` 配置 ESLint（`eslint.config.js`）并提供 `pnpm lint`。
- 服务端统一返回结构：`{ success, data, message }`，降低前端适配成本。

---

## 4. 功能完成度（截至 2026-02-26）

| 模块 | 关键能力 | 当前状态 |
| --- | --- | --- |
| 用户端首页（Query） | 场景切换、城市选择、定位关键词、日期日历、搜索入口 | 已完成 |
| 用户端列表（List） | 服务端拉取、多维筛选、排序、快速筛选、分页加载、错误重试 | 已完成 |
| 用户端详情（Detail） | 图集、房型筛选、价格刷新、库存反馈、选房意图沉淀 | 已完成 |
| 用户端筛选页（Filter） | 星级/价格/标签统一筛选并回写上下文 | 已完成 |
| 管理端认证 | 注册、登录、Token 注入、失效处理 | 已完成 |
| 管理端酒店管理 | 酒店 CRUD、我的酒店、状态展示、提交审核 | 已完成 |
| 管理端房型管理 | 房型 CRUD、库存更新、上下架状态 | 已完成 |
| 管理端审核 | 待审/通过/拒绝分栏与审核动作 | 已完成 |
| 服务端核心 API | 认证、酒店、房型、审核、用户聚合接口 | 已完成 |
| 订单完整链路 | 创建/支付/履约/取消全链路 | 开发中（当前前后端均为占位实现） |
| 地图/支付真实集成 | 地图 SDK、支付网关 | 规划中 |

---

## 5. 技术复杂度说明

本项目的复杂度不在“单点算法”，而在**多端协同与状态一致性**。主要复杂度点如下：

| 复杂度维度 | 复杂度 | 说明 |
| --- | --- | --- |
| 多端协同 | 高 | user/admin 共用服务端契约，状态流转需端到端一致 |
| 数据聚合 | 高 | 服务端将实体数据映射为用户端展示模型（列表 + 详情 + 筛选） |
| 状态治理 | 中高 | 酒店状态 `DRAFT/PENDING/APPROVED/REJECTED` 与权限联动 |
| 跨端适配 | 中高 | H5 与小程序环境差异（API Base、组件、交互）统一处理 |
| 体验工程 | 中 | 骨架屏、错误回退、懒加载、价格刷新提示等细节保障 |

---

## 6. 项目结构（清晰分层）

```text
yisuPlatform/
├─ user/                         # 用户端（Taro，多端发布）
│  ├─ src/components/adaptive/   # 跨端适配组件（H5 / 小程序双实现）
│  ├─ src/pages/query|list|detail|filter
│  ├─ src/services/              # API 调用与聚合
│  ├─ src/store/                 # Zustand 持久化状态
│  └─ src/shared/                # 路由、日期、搜索上下文通用工具
├─ admin/                        # 管理后台
│  ├─ src/api/                   # 业务 API 封装
│  ├─ src/layouts/               # 布局
│  ├─ src/pages/Hotel|Order|...
│  └─ src/utils/request.ts       # Axios 拦截器与统一错误处理
├─ server/                       # API 中间层
│  ├─ src/main.ts                # 当前运行主入口
│  ├─ src/entity-data-service.ts # 实体数据加载/落盘
│  ├─ src/user-mock-service.ts   # 用户侧聚合（筛选/排序/价格刷新）
│  ├─ src/data/                  # runtime-entity-data.json / user-mock-data.json
│  └─ scripts/                   # mock 同步与实体导入脚本
├─ package.json
└─ pnpm-workspace.yaml
```


---

## 7. 表（存储）结构设计与合理性

当前联调主路径采用“**实体存储 + 展示聚合存储**”双层结构，便于快速迭代和端到端联调。

### 7.1 实体层：`server/src/data/runtime-entity-data.json`

#### `users`（用户表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 主键 |
| `username` | string | 登录名（唯一约束语义） |
| `passwordHash` | string | 密码哈希（`bcryptjs`） |
| `role` | `ADMIN \| USER` | 角色权限控制 |

#### `hotels`（酒店表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键（如 `h-001`） |
| `ownerId` | number | 归属用户（关联 `users.id`） |
| `name/city/address/star` | string | 基础信息 |
| `tags` | string[] | 展示与筛选标签 |
| `price/promo/intro/coverImage` | mixed | 经营与展示信息 |
| `status` | `DRAFT/PENDING/APPROVED/REJECTED` | 审核流转状态机 |
| `createdAt/updatedAt` | ISO string | 追踪字段 |

#### `rooms`（房型表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键（如 `r-001`） |
| `hotelId` | string | 所属酒店（关联 `hotels.id`） |
| `name/description/facilities` | mixed | 房型描述信息 |
| `price/stock` | number | 定价与库存 |
| `status` | `ON/OFF` | 上下架状态 |
| `createdAt/updatedAt` | ISO string | 追踪字段 |

> 当前本地样例数据规模（文件快照）：`users=4`、`hotels=124`、`rooms=483`。

### 7.2 展示聚合层：`server/src/data/user-mock-data.json`

| 字段 | 说明 |
| --- | --- |
| `listPool` | 用户端列表池（包含 item 级别展示字段） |
| `detailByItemId` | 按列表项 ID 索引详情 |
| `detailByHotelId` | 按酒店 ID 索引详情 |

### 7.3 设计合理性（为什么这样设计）

1. **实体层与展示层解耦**：后台管理操作基于实体模型，用户侧展示基于聚合模型，避免前端过度拼装。
2. **同源多视图**：`hotelId/baseHotelId/itemId` 组合支持“一个实体酒店 + 多展示变体”的列表体验。
3. **状态机可控**：酒店审核状态集中在 `hotels.status`，权限判断在服务端统一收口。
4. **低成本持久化**：开发阶段通过 JSON 落盘实现“无数据库也可联调”，并可平滑迁移到 DB。
5. **脚本化数据链路**：`sync:user-mock`、`seed:user-entities` 形成可重复的数据构建流程。

---

## 8. 编码规范、代码复用与通用抽取

### 8.1 编码规范（已落地）

- TypeScript 严格模式（`admin`、`server`）。
- 统一响应契约与错误处理逻辑（前后端各自拦截器收口）。
- 关键输入做归一化（日期、筛选值、分页参数、状态枚举）。
- 角色权限检查在服务端集中处理（如 `canManageHotel`、`authMiddleware`）。

### 8.2 代码复用与通用逻辑抽取（核心示例）

| 复用层 | 代表文件 | 复用收益 |
| --- | --- | --- |
| 日期与路由工具 | `user/src/shared/date.ts`、`user/src/shared/route.ts` | 避免页面重复处理日期边界与 URL 编解码 |
| 搜索上下文 | `user/src/shared/search-context.ts` | Query/List/Detail 页面上下文可回放 |
| API 访问层 | `user/src/services/*`、`admin/src/api/*` | 页面不直接写请求细节，便于契约演进 |
| 状态存储层 | `user/src/store/*` | 页面状态、草稿、缓存、已选房型统一管理 |
| 自适配组件层 | `user/src/components/adaptive/*` | H5 与小程序组件差异隔离，页面层无感知 |
| 服务端数据服务层 | `server/src/entity-data-service.ts`、`server/src/user-mock-service.ts` | 持久化与聚合逻辑解耦，提升可维护性 |

---

## 9. 新技术/新实践如何提升研发效率与质量

1. **`pnpm workspace` Monorepo**：三端统一依赖与脚本，减少环境差异和沟通成本。
2. **`Taro 4` 多端同构**：同一套用户端业务可输出 H5 与微信小程序，大幅提升交付效率。
3. **`Zustand + persist`**：搜索草稿/列表缓存/选房草稿可跨页面保留，降低重复请求与状态丢失。
4. **服务端聚合承接 mock**：用户端从静态 mock 迁移到服务端聚合接口，联调更接近真实生产形态。
5. **脚本化数据同步与导入**：`sync:user-mock` + `seed:user-entities` 形成标准化“数据构建流水线”。
6. **user端懒加载与分包策略**：用户端 query 页面延迟加载操作面板与底部导航；生产构建拆分 vendor chunk。

---

## 10. 用户体验增强（自发设计实现）

已落地的体验优化点：

- 首页自定义日期区间日历（含入住/离店连选、最小日期保护、晚数反馈）。
- 列表页骨架屏 + 错误重试 + 空状态 + 上滑/点击双通道加载更多。
- 城市感知的快捷筛选（不同城市注入不同“本地化”筛选标签）。
- 详情页价格刷新、筛选即时生效、库存状态反馈（无房/可订）。
- 选中房型后底部预订条固定展示总价，降低决策跳出。
- 地图弹层预留（Mock）与回退路径容错（无上一页时自动回 Query/List）。

---

## 11. 快速开始

### 11.1 环境要求

- Node.js >= 18
- pnpm >= 8

### 11.2 安装依赖

```bash
pnpm install
```

### 11.3 启动三端（推荐 3 个终端）

```bash
# 1) server
pnpm --filter yisu-platform-server dev

# 2) admin
pnpm dev:admin

# 3) user H5
pnpm dev:user
```

默认访问地址：

- Admin: `http://localhost:3000`
- User H5: `http://localhost:10087`
- Server API: `http://localhost:3001`

### 11.4 微信小程序联调

```bash
# 本机开发者工具
pnpm dev:user:weapp

# 真机/局域网建议显式指定服务端地址
TARO_APP_WEAPP_DEV_API_BASE=http://<你的局域网IP>:3001/api pnpm dev:user:weapp
```

---

## 12. 常用脚本

### 根目录

```bash
pnpm dev:user
pnpm build:user
pnpm dev:user:weapp
pnpm build:user:weapp
pnpm dev:admin
pnpm build:admin
```

### server 子项目

```bash
cd server
pnpm dev
pnpm build
pnpm start
pnpm sync:user-mock
pnpm seed:user-entities
```

---

## 13. API 快速索引（核心）

### 认证

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### 酒店与房型

- `GET /api/hotels`
- `GET /api/hotels/:id`
- `POST /api/hotels`
- `PUT /api/hotels/:id`
- `DELETE /api/hotels/:id`
- `GET /api/hotels/:id/rooms`
- `POST /api/hotels/:id/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `PATCH /api/rooms/:id/stock`

### 审核

- `GET /api/admin/hotels`
- `POST /api/admin/hotels/:id/approve`
- `POST /api/admin/hotels/:id/reject`

### 用户端聚合

- `GET /api/user/hotels`
- `GET /api/user/hotels/:id/detail`
- `POST /api/user/hotels/:id/detail/refresh-prices`

---

## 携程前端训练营第五期22组协作完成
