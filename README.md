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

# 开发
pnpm dev
```

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

## 演示账号

- 邮箱: demo@example.com
- 密码: demo123

## 命令面板

按 `Cmd+K` (Mac) 或 `Ctrl+K` (Windows) 打开命令面板，可快速跳转：

- 首页 (h)
- 商品列表 (p)
- 商品搜索 (s)
- 购物车 (c)
