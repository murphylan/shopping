# H5 小商城

基于 Next.js 16 的 H5 小商城，支持购物车、商品搜索等功能。

## 技术栈

- **框架**: Next.js 16 + React 19 + TypeScript
- **数据库**: Drizzle ORM + PostgreSQL
- **状态管理**: TanStack React Query + Zustand + nuqs
- **UI**: Tailwind CSS v4 + shadcn/ui
- **表单**: React Hook Form + Zod
- **身份验证**: NextAuth.js v5
- **命令面板**: kbar (Cmd+K / Ctrl+K)

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 配置 DATABASE_URL 和 AUTH_SECRET

# 生成 AUTH_SECRET
npx auth secret

# 数据库迁移（需先启动 PostgreSQL）
pnpm db:generate
pnpm db:migrate

# 初始化演示数据（商品与图片 URL、演示账号）
pnpm db:seed

# 开发
pnpm dev
```

## 部署

### 镜像仓库

所有镜像统一托管在私有 Registry `zot.murphylan.cloud`：

| 镜像                                             | 用途              |
| ------------------------------------------------ | ----------------- |
| `zot.murphylan.cloud/murphy/shopping`            | 应用镜像 (~265MB) |
| `zot.murphylan.cloud/library/node:22-alpine`     | 构建基础镜像      |
| `zot.murphylan.cloud/library/postgres:17-alpine` | 数据库镜像        |

### 构建与推送

```bash
# 登录 Registry
podman login zot.murphylan.cloud

# 构建镜像
./scripts/build-image.sh              # 构建 :latest
./scripts/build-image.sh v1.0.1       # 构建 :v1.0.1 + :latest

# 推送镜像
./scripts/push-image.sh               # 推送 :latest
./scripts/push-image.sh v1.0.1        # 推送 :v1.0.1 + :latest
```

### 服务器部署

一键部署脚本，支持 standalone（自带 PG）和 shared（共享 PG）两种数据库模式：

```bash
curl -fsSL https://github.com/murphylan/shopping/releases/download/stable/install.sh | bash -s -- \
  --db-mode shared --port 3005 --domain shopping.murphylan.cloud
```

支持参数：

| 参数             | 默认值            | 说明                                          |
| ---------------- | ----------------- | --------------------------------------------- |
| `--port`         | `3005`            | 宿主机映射端口                                |
| `--domain`       | -                 | 公网域名                                      |
| `--db-mode`      | `standalone`      | `standalone` 自带 PG / `shared` 共享宿主机 PG |
| `--db-port`      | `5433`            | shared 模式下宿主机 PG 端口                   |
| `--db-name`      | `shopping`        | 数据库名                                      |
| `--install-dir`  | `~/work/shopping` | 安装目录                                      |
| `--skip-db-init` | -                 | 跳过共享 PG 容器创建                          |
| `--yes`          | -                 | 跳过确认，全自动                              |

### 更新部署

```bash
podman pull --tls-verify=false zot.murphylan.cloud/murphy/shopping:latest && podman-compose down && podman-compose up -d
```

### 生产构建说明

- 应用使用 **Next.js `output: "standalone"`**（见 `next.config.ts`），由 `Containerfile` 多阶段构建
- 数据库结构同步使用容器内 `npx drizzle-kit push`，在 `install.sh` 部署时自动执行

## 初始化数据与账号

### 何时执行

- **本地开发**：在 `pnpm db:migrate`（或 `drizzle-kit push`）之后执行 `pnpm db:seed`
- **部署上线**：`install.sh` 部署完成后，在任意安装了项目依赖且 `DATABASE_URL` 指向该库的环境执行一次 `pnpm db:seed`

### `pnpm db:seed` 写入内容

- **用户**：`scripts/seed.ts` 中两条演示账号（密码存 bcrypt 哈希）
- **商品**：`src/lib/seed-data.ts` 中 16 条商品，含图片 URL（对应 `public/images` 下静态资源）

执行完成后，终端会打印初始化账号邮箱与密码（生产环境请立即修改密码）。

### 演示账号

| 角色     | 邮箱                | 密码       | 说明                         |
| -------- | ------------------- | ---------- | ---------------------------- |
| 普通用户 | `user@example.com`  | `user123`  | 商城前台                     |
| 管理员   | `admin@example.com` | `admin123` | 管理后台 (`/admin/products`) |

须先成功执行 `pnpm db:seed`，否则 `users` 表无记录将无法登录。

### 管理后台

- 未配置 `ADMIN_EMAILS` 时，默认将 `admin@example.com` 视为管理员
- 可在 `.env` / `.env.local` 中设置 `ADMIN_EMAILS`（逗号分隔多个邮箱）以扩展管理员列表

## 脚本说明

| 脚本                     | 用途                |
| ------------------------ | ------------------- |
| `scripts/build-image.sh` | 本地构建镜像        |
| `scripts/push-image.sh`  | 推送镜像到 Registry |
| `scripts/install.sh`     | 服务器一键部署      |
| `scripts/backup.sh`      | 数据库备份          |
| `scripts/image-env.sh`   | 构建/推送共享变量   |
| `scripts/seed.ts`        | 初始化演示数据      |

## 项目结构

```
src/
├── app/
│   ├── (auth)/login/     # 登录页
│   ├── (platform)/       # 平台页面
│   │   ├── products/     # 商品列表
│   │   ├── search/       # 商品搜索（nuqs 管理 URL 参数）
│   │   └── cart/         # 购物车
│   └── api/auth/         # NextAuth 路由
├── components/
│   ├── ui/               # shadcn/ui 组件
│   ├── shared/           # 业务共享组件
│   └── providers.tsx     # 全局 Provider
├── hooks/                # 自定义 Hooks
├── server/
│   ├── actions/          # Server Actions
│   └── db/schema/        # Drizzle Schema
├── types/                # 类型定义
└── lib/                  # 工具函数
```

## 代码规范

项目严格遵循 `.cursor/rules/` 下的规范文件。

## 命令面板

按 `Cmd+K` (Mac) 或 `Ctrl+K` (Windows) 打开命令面板，可快速跳转：

- 首页 (h)
- 商品列表 (p)
- 商品搜索 (s)
- 购物车 (c)
