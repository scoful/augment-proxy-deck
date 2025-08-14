# Augment Proxy Deck

数据展示平台 - 基于 [T3 Stack](https://create.t3.gg/) 构建的数据统计和分析平台。

## 项目概述

Augment Proxy Deck 是一个数据展示和统计分析平台，提供以下功能模块：

- **用户统计**: 查看用户注册、活跃度等相关统计数据
- **黑车统计**: 监控和分析黑车相关数据统计
- **按小时统计**: 查看按小时维度的各项数据统计

## 项目结构

```
src/
├── components/          # 可复用组件
│   └── Layout.tsx      # 页面布局组件
├── pages/              # 页面路由
│   ├── index.tsx       # 首页 - 数据模块入口
│   └── stats/          # 统计页面
│       ├── users.tsx   # 用户统计页面
│       ├── vehicles.tsx # 黑车统计页面
│       └── hourly.tsx  # 按小时统计页面
├── server/             # 服务端代码
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org) - React 全栈框架
- **语言**: TypeScript - 类型安全的 JavaScript
- **API**: [tRPC](https://trpc.io) - 端到端类型安全的 API
- **样式**: [Tailwind CSS v4](https://tailwindcss.com) - 实用优先的 CSS 框架
- **图标**: [Heroicons](https://heroicons.com) - 精美的 SVG 图标
- **状态管理**: [TanStack Query](https://tanstack.com/query) - 数据获取和缓存
- **包管理**: pnpm - 快速、节省磁盘空间的包管理器

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
pnpm typecheck
```

## 功能特性

### 已实现功能 ✅

1. **首页数据展示**
   - 3个数据模块入口卡片
   - 实时显示用户统计概览
   - 响应式设计

2. **用户统计页面** (`/stats/users`)
   - 实时数据获取 (API: `https://proxy.poolhub.me/api/stats`)
   - 1小时和24小时活跃用户统计
   - 用户排行榜 (1小时和24小时)
   - 完整用户列表表格
   - 可调节显示条数 (50/100/200/500)

3. **技术实现**
   - tRPC API 路由 (`/api/stats`)
   - TypeScript 类型安全
   - 错误处理和加载状态
   - 数据验证 (Zod)

### 待开发功能 ⏳

- 黑车统计页面的真实数据接入
- 按小时统计页面的真实数据接入
- 图表组件集成
- 数据缓存优化

## API 接口

### 用户统计 API

- **路由**: `api.stats.getUserStats`
- **参数**: `{ limit: number }` (默认: 100)
- **返回**: 用户统计完整数据
- **外部API**: `https://proxy.poolhub.me/api/stats?limit={limit}`

### 用户统计摘要 API

- **路由**: `api.stats.getUserStatsSummary`
- **参数**: 无
- **返回**: 仅摘要信息
- **用途**: 首页快速概览

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
