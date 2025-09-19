# Vercel Cron Jobs 设置指南

本指南将帮助你在Vercel上配置定时任务，实现每日自动数据收集。

## 🚀 快速设置

### 1. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```bash
# 生成随机密钥
openssl rand -base64 32

# 在Vercel Dashboard中设置
CRON_SECRET=your-generated-secret-here
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

### 2. 部署到生产环境

```bash
# 部署到Vercel生产环境
vercel --prod
```

### 3. 验证Cron任务

部署后，cron任务将自动配置：
- **时间**: 每日16:05 UTC (UTC+8 00:05)
- **端点**: `/api/cron`
- **功能**: 执行完整的每日数据采集

## 📋 配置文件说明

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "5 16 * * *"
    }
  ]
}
```

### API路由
- `/api/cron` - Vercel cron任务端点
- 需要`CRON_SECRET`认证
- 调用`collectDailyStats()`函数

## 🧪 测试方法

### 本地测试
```bash
# 设置环境变量
export CRON_SECRET="your-secret"

# 测试API端点
curl -H "Authorization: Bearer your-secret" http://localhost:3000/api/cron
```

### 生产环境测试
直接访问cron端点（需要认证）：
```bash
curl -H "Authorization: Bearer your-secret" https://your-app.vercel.app/api/cron
```

## 🔍 监控和日志

- Vercel Functions日志：查看执行状态
- 数据库日志：检查`collection_logs`表
- 应用内监控：历史统计页面

## ⚠️ 注意事项

1. **只在生产环境运行**：Vercel cron jobs不在预览部署中执行
2. **时区一致性**：保持与Cloudflare相同的UTC+8 00:05执行时间
3. **认证安全**：确保`CRON_SECRET`足够复杂且保密
4. **数据库连接**：确保Turso配置正确

## 🔧 故障排除

### 常见问题

1. **401 Unauthorized**
   - 检查`CRON_SECRET`环境变量
   - 确保密钥匹配

2. **数据库连接失败**
   - 验证Turso配置
   - 检查网络连接

3. **Cron未执行**
   - 确保部署到生产环境
   - 检查Vercel Functions日志
