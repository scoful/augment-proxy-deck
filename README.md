# Augment Proxy Deck

🚀 **现代化数据展示平台** - 基于 [T3 Stack](https://create.t3.gg/) 构建的实时数据统计和分析平台

## 项目概述

Augment Proxy Deck 是一个功能完整的数据展示和统计分析平台，提供实时数据监控和可视化分析：

### 🎯 核心功能模块

- **📊 设备统计** - 实时设备活跃度、请求量统计和排行榜
- **🚗 车辆统计** - 车辆使用情况、状态监控和数据分析
- **⏰ 按小时统计** - 多维度时间序列数据可视化和趋势分析

### ✨ 特色功能

- **实时数据更新** - 自动轮询最新数据，支持自定义刷新频率
- **丰富图表组件** - 10+ 种专业图表类型，支持交互式数据探索
- **响应式设计** - 完美适配桌面端和移动端设备
- **类型安全** - 端到端 TypeScript 类型保护

## 📁 项目结构

```
src/
├── components/                 # 🧩 可复用组件库
│   ├── Layout.tsx             # 页面布局组件
│   ├── ErrorBoundary.tsx      # 错误边界组件
│   └── charts/                # 📈 图表组件集合
│       ├── CumulativeChart.tsx      # 累积趋势图
│       ├── DensityHeatmap.tsx       # 密度热力图
│       ├── GrowthRadarChart.tsx     # 增长雷达图
│       ├── GrowthRateChart.tsx      # 增长率柱状图
│       ├── HourlyAreaChart.tsx      # 小时面积图
│       ├── HourlyBarChart.tsx       # 小时柱状图
│       ├── HourlyTrendChart.tsx     # 小时趋势图
│       ├── PeakValleyChart.tsx      # 峰谷分析图
│       └── TimePeriodPieChart.tsx   # 时段饼图
├── pages/                     # 🌐 页面路由
│   ├── index.tsx             # 首页 - 数据模块入口
│   ├── _app.tsx              # 应用入口配置
│   └── stats/                # 📊 统计页面
│       ├── users.tsx         # 设备统计页面
│       ├── vehicles.tsx      # 车辆统计页面
│       └── hourly.tsx        # 按小时统计页面
├── server/                   # ⚙️ 服务端代码
│   └── api/                  # API 路由定义
│       ├── root.ts           # API 根路由
│       ├── trpc.ts           # tRPC 配置
│       └── routers/          # API 路由模块
│           ├── stats.ts      # 统计数据 API
│           └── post.ts       # 示例 API
├── utils/                    # 🛠️ 工具函数
│   ├── api.ts               # API 客户端配置
│   ├── config.ts            # 应用配置
│   └── formatters.ts        # 数据格式化工具
└── styles/                   # 🎨 样式文件
    └── globals.css          # 全局样式
```

## 🛠️ 技术栈

### 核心技术
- **⚡ 框架**: [Next.js 15](https://nextjs.org) - React 全栈框架，支持 Turbo 模式
- **🔷 语言**: TypeScript - 严格类型检查，确保代码质量
- **🔗 API**: [tRPC](https://trpc.io) - 端到端类型安全的 API，零运行时开销
- **🎨 样式**: [Tailwind CSS v4](https://tailwindcss.com) - 现代化 CSS 框架
- **📊 图表**: [Recharts](https://recharts.org) - 基于 React 的图表库
- **🎯 图标**: [Heroicons](https://heroicons.com) - 精美的 SVG 图标库

### 开发工具
- **📦 包管理**: pnpm - 高效的包管理器
- **🔍 代码检查**: ESLint + Prettier - 代码质量保证
- **🚀 状态管理**: [TanStack Query](https://tanstack.com/query) - 强大的数据获取和缓存
- **✅ 数据验证**: Zod - 运行时类型验证

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```
访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 可用脚本

| 命令 | 描述 |
|------|------|
| `pnpm dev` | 启动开发服务器 (支持 Turbo 模式) |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm preview` | 构建并预览生产版本 |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm lint:fix` | 自动修复 ESLint 问题 |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm check` | 运行完整检查 (lint + typecheck) |
| `pnpm format:check` | 检查代码格式 |
| `pnpm format:write` | 自动格式化代码 |

## ✨ 功能特性

### 🎯 核心功能

#### 📊 首页数据概览
- **实时数据卡片** - 3个核心数据模块的实时概览
- **智能刷新** - 自动轮询更新，可配置刷新频率
- **响应式布局** - 完美适配各种屏幕尺寸

#### 👥 设备统计页面 (`/stats/users`)
- **实时数据监控** - 连接外部 API 获取最新数据
- **多维度统计** - 1小时/24小时活跃设备和请求量
- **排行榜系统** - 设备活跃度实时排名
- **高级表格** - 支持搜索、排序、分页功能
- **灵活显示** - 可调节显示条数 (50/100/200/500)

#### 🚗 车辆统计页面 (`/stats/vehicles`)
- **车辆状态监控** - 实时车辆使用情况
- **数据分析** - 车辆使用率、状态分布统计
- **搜索过滤** - 支持多条件筛选和搜索

#### ⏰ 按小时统计页面 (`/stats/hourly`)
- **10+ 专业图表** - 多种可视化展示方式
  - 📈 **趋势图** - 时间序列数据趋势分析
  - 📊 **柱状图** - 小时对比数据展示
  - 🌊 **面积图** - 累积数据可视化
  - 📊 **增长率图** - 同比增长分析
  - 🎯 **雷达图** - 多维度数据对比
  - 📈 **累积图** - 数据累积趋势
  - 🔥 **热力图** - 时间密度分析
  - ⛰️ **峰谷图** - 数据波动分析
  - 🥧 **饼图** - 时段分布统计

### 🔧 技术特性

- **🔒 类型安全** - 端到端 TypeScript 类型保护
- **⚡ 性能优化** - React Query 缓存 + 智能轮询
- **🛡️ 错误处理** - 完善的错误边界和状态管理
- **📱 响应式设计** - 移动端友好的用户界面
- **🎨 现代化 UI** - 基于 Tailwind CSS 的精美设计
- **🔍 代码质量** - ESLint + Prettier + TypeScript 严格检查

## 🔌 API 接口

### 📊 统计数据 API

| API 路由 | 参数 | 返回数据 | 描述 |
|---------|------|----------|------|
| `api.stats.getUserStats` | `{ limit: number }` | 完整设备统计 | 获取设备详细统计数据 |
| `api.stats.getUserStatsSummary` | 无 | 设备统计摘要 | 首页快速概览数据 |
| `api.stats.getCarStats` | 无 | 完整车辆统计 | 获取车辆详细统计数据 |
| `api.stats.getCarStatsSummary` | 无 | 车辆统计摘要 | 车辆概览数据 |
| `api.stats.getHourlyStats` | 无 | 按小时统计 | 时间序列统计数据 |
| `api.stats.getHourlyStatsSummary` | 无 | 小时统计摘要 | 小时数据概览 |


### 🔄 数据更新策略
- **首页**: 60秒轮询
- **设备统计页**: 60秒轮询
- **车辆统计页**: 60秒轮询
- **按小时统计页**: 60秒轮询
- **错误重试**: 指数退避策略 (最大30秒延迟)

## 🏗️ 项目架构

### 设计原则
- **🎯 类型安全优先** - 端到端 TypeScript 类型保护
- **⚡ 性能优化** - 智能缓存和数据获取策略
- **🧩 组件化设计** - 高度可复用的组件架构
- **📱 响应式优先** - 移动端友好的设计理念

### 数据流
```
外部 API → tRPC Router → React Query → UI 组件
     ↓
  Zod 验证 → TypeScript 类型 → 缓存策略
```

## 🚀 部署指南

### Vercel 部署 (推荐)
[![](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fscoful%2Faugment-proxy-deck&project-name=augment-proxy-deck&repository-name=augment-proxy-deck)`

### 传统部署
```bash
pnpm build
pnpm start
```

## 📚 学习资源

### T3 Stack 相关
- [T3 Stack 官方文档](https://create.t3.gg/)
- [T3 Stack 学习指南](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
- [create-t3-app GitHub](https://github.com/t3-oss/create-t3-app)

### 技术文档
- [Next.js 15 文档](https://nextjs.org/docs)
- [tRPC 官方指南](https://trpc.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts 图表库](https://recharts.org/en-US/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**🌟 如果这个项目对你有帮助，请给个 Star！**
