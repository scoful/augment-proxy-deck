# Cloudflare 部署指南

本指南将帮助你将 Augment Proxy Deck 部署到 Cloudflare，并配置自动数据收集。

## 🚀 快速部署

### 方法一：自动部署脚本

```bash
# 给脚本执行权限
chmod +x scripts/deploy-cloudflare.sh

# 运行部署脚本
./scripts/deploy-cloudflare.sh
```

### 方法二：手动部署

#### 1. 环境准备

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 安装项目依赖
pnpm install
```

#### 2. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create augment-proxy-deck-db

# 记录返回的 database_id，更新 wrangler.toml
```

#### 3. 更新配置文件

编辑 `wrangler.toml`，将 `your-database-id-here` 替换为实际的数据库ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "augment-proxy-deck-db"
database_id = "your-actual-database-id"
```

#### 4. 数据库迁移

```bash
# 生成迁移文件
pnpm run db:generate

# 应用迁移到远程数据库
wrangler d1 migrations apply augment-proxy-deck-db --remote
```

#### 5. 构建和部署

```bash
# 构建项目
pnpm run build:cloudflare

# 部署到 Cloudflare
wrangler deploy
```

## 📊 数据收集配置

### Cron Triggers

部署后，以下定时任务将自动运行：

- **每日 00:05 UTC**: 日报数据采集（用户、车辆汇总、系统统计）
- **每 30 分钟**: 车辆明细数据采集

### 验证 Cron 任务

```bash
# 查看 Cron 任务状态
wrangler cron trigger --cron "5 0 * * *"

# 查看日志
wrangler tail
```

## 🔧 环境变量

目前项目不需要额外的环境变量，所有配置都在代码中。

## 📋 部署后检查清单

- [ ] 应用可以正常访问
- [ ] D1 数据库已创建并迁移
- [ ] Cron 任务已配置
- [ ] 数据收集功能正常

### 测试数据收集

访问你的应用，进入历史统计页面，点击手动触发数据收集来测试功能。

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.toml` 中的数据库配置
   - 确保数据库迁移已执行

2. **Cron 任务不执行**
   - 检查 Cloudflare Dashboard 中的 Cron Triggers
   - 查看 Worker 日志

3. **构建失败**
   - 确保所有依赖已安装
   - 检查 TypeScript 编译错误

### 查看日志

```bash
# 实时查看 Worker 日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 1h
```

## 📈 监控和维护

### 数据收集监控

- 访问历史统计页面查看数据收集日志
- 检查 `collection_logs` 表中的执行记录
- 监控 Cloudflare Dashboard 中的 Worker 指标

### 数据库维护

```bash
# 查看数据库大小
wrangler d1 info augment-proxy-deck-db

# 备份数据库
wrangler d1 export augment-proxy-deck-db --output backup.sql
```

## 🔄 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建和部署
pnpm run build:cloudflare
wrangler deploy
```

## 📞 支持

如果遇到问题，请检查：
1. Cloudflare Dashboard 中的 Worker 状态
2. D1 数据库连接状态
3. Cron Triggers 配置
4. Worker 执行日志
