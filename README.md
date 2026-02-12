# 易宿酒店预订平台 🏨

基于 `pnpm workspace` 的 monorepo 项目根目录，已将移动端代码整理到 `user` 包下，后续可继续接入 `server` 与 `pc`。

## 目录结构

```text
yisuPlatform/
├─ user/                  # 移动端（Taro + React）
│  ├─ src/
│  ├─ config/
│  ├─ babel.config.js
│  └─ package.json
├─ vendors/               # 本地 vendor 依赖（sass）
├─ package.json           # workspace 根配置
└─ pnpm-workspace.yaml
```

## 命令

```bash
# 在仓库根目录安装 workspace 依赖
pnpm install

# 启动移动端（H5）
pnpm dev:user

# 构建移动端（H5）
pnpm build:user
```
