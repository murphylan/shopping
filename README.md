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

本项目使用 **Podman** 与 **podman-compose**（`compose.yml` 为 Compose 格式，由 Podman 解析；不使用 Docker）。

### Podman Compose

适用于已安装 **Podman** 与 **podman-compose** 的 Linux 服务器（与 `scripts/deploy.sh` 一致）。

1. 复制环境变量模板并填写必填项：

   ```bash
   cp .env.example .env
   # 编辑 .env：POSTGRES_PASSWORD、AUTH_SECRET、COMPOSE_PROJECT_NAME 等
   ```

2. **必填环境变量（`.env`）**

   | 变量                   | 说明                                                                       |
   | ---------------------- | -------------------------------------------------------------------------- |
   | `POSTGRES_PASSWORD`    | PostgreSQL 密码                                                            |
   | `AUTH_SECRET`          | NextAuth 密钥，可用 `openssl rand -base64 32` 生成                         |
   | `AUTH_URL`             | 公网访问时**必填**：与浏览器地址一致，含协议，如 `https://your-domain.com` |
   | `AUTH_TRUST_HOST`      | 反代/HTTPS 场景通常为 `true`（见 `.env.example`）                          |
   | `APP_PORT`             | 宿主机映射端口，默认 `3000`                                                |
   | `COMPOSE_PROJECT_NAME` | 同一主机多实例时需唯一，用于容器命名                                       |

3. 执行部署脚本（构建镜像、启动 `db` + `app`、在应用容器内执行 `drizzle-kit push` 同步表结构）：

   ```bash
   ./scripts/deploy.sh
   ```

4. 脚本结束后，默认访问地址为 `http://localhost:${APP_PORT:-3000}`（若仅本机调试）。公网部署请配置反向代理，并保证 **`AUTH_URL` 与对外访问 URL 一致**。

5. **首次部署后需初始化数据**：当前镜像未在启动时自动执行 seed，请在**能访问该 PostgreSQL 的环境**执行一次（见下文「初始化数据与账号」）。

### 生产构建说明

- 应用使用 **Next.js `output: "standalone"`**（见 `next.config.ts`），由根目录 `Containerfile` 多阶段构建。
- 部署脚本中的「同步数据库结构」使用容器内 **`npx drizzle-kit push`**；若你更倾向迁移文件，可在进入容器后改用 `pnpm db:migrate`（需将迁移与工具链纳入镜像或挂载）。

## 初始化数据与账号

### 何时执行

- **本地开发**：在 `pnpm db:migrate`（或 `drizzle-kit push`）之后执行 **`pnpm db:seed`**。
- **部署上线**：在数据库可写且已存在表结构后，在任意安装了项目依赖、且 **`DATABASE_URL` 指向该库** 的环境执行一次 **`pnpm db:seed`**（例如开发机 `.env` 中填写生产库连接串，或 SSH 到内网执行）。

### `pnpm db:seed` 写入内容

- **用户**：`scripts/seed.ts` 中两条演示账号（密码存 bcrypt 哈希，登录由数据库校验）：**普通用户**与**管理员**。
- **商品**：与 `src/lib/seed-data.ts` 中 **`SEED_PRODUCTS`** 一致的 **16 条** 商品，含 **图片 URL**（站内路径，如 `/images/products/...`，对应 `public/images` 下静态资源）。

执行完成后，终端会打印 **初始化账号邮箱与密码**（生产环境请立即修改密码）。

### 演示账号（登录）

| 角色     | 邮箱                | 密码       | 说明                                         |
| -------- | ------------------- | ---------- | -------------------------------------------- |
| 普通用户 | `user@example.com`  | `user123`  | 商城前台                                     |
| 管理员   | `admin@example.com` | `admin123` | 登录后跳转 **管理后台**（`/admin/products`） |

说明：须先成功执行 **`pnpm db:seed`**，否则 `users` 表无对应记录将无法登录。

### 管理后台

- 未配置 **`ADMIN_EMAILS`** 时，默认将 **`admin@example.com`** 视为管理员（与 `pnpm db:seed` 中的管理员账号一致）。
- 可在 `.env` / `.env.local` 中设置 **`ADMIN_EMAILS`**（逗号分隔多个邮箱）以扩展管理员列表；登录后可在「我的」进入 **管理后台**，或直接访问 **`/admin/products`**。

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

项目严格遵循 `.cursor` 下的规则，已通过 `install.sh` 安装到 `.cursor/rules/`。

## 命令面板

按 `Cmd+K` (Mac) 或 `Ctrl+K` (Windows) 打开命令面板，可快速跳转：

- 首页 (h)
- 商品列表 (p)
- 商品搜索 (s)
- 购物车 (c)
