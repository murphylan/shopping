# H5 小商城设计方案

基于 Next.js 16 的 H5 小商城，严格遵循 `/Users/zla3/work/murphy/requirement/.cursor` 下的代码规范。

## 技术栈

| 类别     | 技术                                                          | 说明                |
| -------- | ------------------------------------------------------------- | ------------------- |
| 框架     | Next.js 16 + React 19 + TypeScript                            | App Router          |
| 数据库   | Drizzle ORM + PostgreSQL                                      | 禁止使用 Prisma     |
| 状态管理 | TanStack React Query (服务端) + Zustand (客户端) + nuqs (URL) |                     |
| UI       | Radix UI + Tailwind CSS v4 + shadcn/ui                        | Databricks 风格     |
| 表单     | React Hook Form + Zod                                         | 遵循规范，非 Formik |
| 提示     | sonner (toast) + nextjs-toploader (加载条)                    |                     |
| 身份验证 | NextAuth.js v5                                                |                     |
| 命令面板 | kbar                                                          |                     |
| 表格     | TanStack Table + DataTable/DataTableVirtualized               |                     |
| 代码质量 | ESLint + Prettier + Husky                                     |                     |

## 1. 项目结构

```
src/
├── app/
│   ├── (auth)/              # 认证相关（登录/注册）
│   │   └── login/
│   ├── (platform)/          # 平台页面（需登录）
│   │   ├── products/        # 商品列表
│   │   ├── search/          # 商品搜索
│   │   ├── cart/            # 购物车
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/[...nextauth]/
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui 基础组件
│   ├── data-table/          # 表格组件
│   └── shared/              # 业务共享组件
├── hooks/                   # use-{domain}.ts
├── server/
│   ├── actions/             # {entity}Action.ts
│   ├── auth/                # 认证相关
│   └── db/
│       └── schema/          # Drizzle Schema
├── types/                   # {domain}-types.ts
└── lib/                     # 工具函数
```

## 2. 页面与路由设计

| 路径             | 说明                          | 需登录 |
| ---------------- | ----------------------------- | ------ |
| `/`              | 首页/商品列表                 | 否     |
| `/search`        | 商品搜索（nuqs 管理搜索参数） | 否     |
| `/products/[id]` | 商品详情                      | 否     |
| `/cart`          | 购物车                        | 是     |
| `/login`         | 登录                          | 否     |

## 3. 状态管理设计

### Zustand Store

- `useCartStore` - 购物车状态（商品、数量、本地持久化）
- `useUIStore` - UI 状态（侧边栏、模态框等）

### nuqs

- 搜索页：`keyword`、`category`、`sort`、`page`
- 商品列表：`page`、`pageSize`

### React Query

- 商品列表、商品详情、搜索建议等服务端数据

## 4. 身份验证（NextAuth.js v5）

- Credentials Provider（用户名密码）
- 可选：OAuth（Google/GitHub）
- `getCurrentUser()` 用于 Server Actions 权限校验

## 5. 数据获取与缓存

- 页面 → Hook → Server Action → Drizzle → PostgreSQL
- `useProducts`、`useProduct`、`useSearchProducts` 等
- `staleTime: 0` 保证数据新鲜

## 6. 表单处理

- React Hook Form + Zod（遵循规范）
- 登录表单、购物车数量编辑、地址表单等

## 7. 命令面板（kbar）

- 全局快捷键 `Cmd+K` / `Ctrl+K`
- 搜索商品、跳转页面、打开购物车

## 8. 表格展示

- 商品管理（后台）：DataTable / DataTableVirtualized
- 购物车：自定义列表（非表格）

## 9. 样式与主题

- Tailwind CSS v4 + 8px 网格系统
- Databricks 风格：清晰、简洁、高效
- 按钮：图标 + 文字
- 禁止硬编码高度，使用 Flex 填充

## 10. 代码质量

- ESLint + Prettier
- Husky 预提交：lint-staged
- 路径别名 `@/`
- 导入顺序：React → Next.js → Third-party → UI → Hooks → Server Actions → Types
