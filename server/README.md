# yisu-platform-server

易宿平台服务端（当前联调主实现）。

## 当前实现状态

- 运行入口：`src/main.ts`
- 实体数据存储：`src/data/runtime-entity-data.json`（启动加载，写操作实时落盘）
- 用户端数据聚合：`src/user-mock-service.ts`（基于实体酒店/房型动态生成）
- 同步后的静态 mock：`src/data/user-mock-data.json`

> 说明：`src/modules/**` 下保留了历史 TypeORM 代码，但当前 `build` 不会编译它们，默认也不参与运行。

## 技术栈

- Node.js + Express 4
- TypeScript
- JWT (`jsonwebtoken`)
- 密码加密 (`bcryptjs`)

## 本地运行

```bash
pnpm install
pnpm dev
```

默认地址：`http://localhost:3001`

## 构建与启动

```bash
pnpm build
pnpm start
```

## Mock 同步与实体导入（可选）

1) 把 `user` 端 mock 重新同步到服务端 JSON：

```bash
pnpm sync:user-mock
```

输出文件：`src/data/user-mock-data.json`

2) 把同步后的 mock 导入实体酒店/房型数据源（admin/user 同源）：

```bash
pnpm seed:user-entities
```

输出文件：`src/data/runtime-entity-data.json`

## 关键环境变量

- `PORT`（默认 `3001`）
- `USER_MOCK_MERGE_MODE`
  - 默认：`runtime-only`（有运行时酒店时，仅返回运行时数据）
  - 可选：`hybrid`（运行时 + 静态 mock 合并）

## 主要接口

- 认证
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/profile`
- 酒店（管理端/商家端）
  - `GET /api/hotels`
  - `GET /api/hotels/:id`
  - `POST /api/hotels`
  - `PUT /api/hotels/:id`
  - `DELETE /api/hotels/:id`
  - `POST /api/hotels/:id/submit`
  - `POST /api/hotels/:id/publish`
  - `POST /api/hotels/:id/offline`
  - `GET /api/hotels/my/list`
- 房型
  - `GET /api/hotels/:id/rooms`
  - `POST /api/hotels/:id/rooms`
  - `GET /api/rooms/:id`
  - `PUT /api/rooms/:id`
  - `DELETE /api/rooms/:id`
  - `PATCH /api/rooms/:id/stock`
- 管理员审核
  - `GET /api/admin/hotels`
  - `POST /api/admin/hotels/:id/approve`
  - `POST /api/admin/hotels/:id/reject`
- 用户端聚合接口
  - `GET /api/user/hotels`
  - `GET /api/user/hotels/:id/detail`
  - `POST /api/user/hotels/:id/detail/refresh-prices`

## 返回契约说明

当前列表接口返回兼容格式：

```json
{
  "success": true,
  "data": {
    "list": [],
    "total": 0
  },
  "total": 0
}
```

这样可兼容已有前端拦截器与新契约读取方式。
