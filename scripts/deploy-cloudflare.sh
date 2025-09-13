#!/bin/bash

# Cloudflare 部署脚本
# 用于部署到 Cloudflare Pages + Workers + D1

set -e

echo "🚀 开始部署到 Cloudflare..."

# 1. 检查必要的工具
echo "📋 检查部署环境..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler CLI 未安装，请先安装: npm install -g wrangler"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请先安装: npm install -g pnpm"
    exit 1
fi

# 2. 检查登录状态
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ 未登录 Cloudflare，请先登录: wrangler login"
    exit 1
fi

# 3. 创建 D1 数据库（如果不存在）
echo "🗄️ 创建 D1 数据库..."
DB_NAME="augment-proxy-deck-db"

# 检查数据库是否已存在
if wrangler d1 list | grep -q "$DB_NAME"; then
    echo "✅ D1 数据库已存在: $DB_NAME"
    DB_ID=$(wrangler d1 list | grep "$DB_NAME" | awk '{print $1}')
else
    echo "📦 创建新的 D1 数据库: $DB_NAME"
    DB_OUTPUT=$(wrangler d1 create "$DB_NAME")
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | cut -d'"' -f4)
    
    # 更新 wrangler.toml 中的数据库ID
    sed -i "s/your-database-id-here/$DB_ID/g" wrangler.toml
    echo "✅ 已更新 wrangler.toml 中的数据库ID: $DB_ID"
fi

# 4. 运行数据库迁移
echo "🔄 执行数据库迁移..."
pnpm run db:generate
wrangler d1 migrations apply "$DB_NAME" --remote

# 5. 构建项目
echo "🔨 构建项目..."
pnpm run build:cloudflare

# 6. 部署到 Cloudflare
echo "🚀 部署到 Cloudflare..."
wrangler deploy

echo "✅ 部署完成！"
echo ""
echo "📋 部署信息:"
echo "  - 应用名称: augment-proxy-deck"
echo "  - D1 数据库: $DB_NAME ($DB_ID)"
echo "  - Cron 任务: 已配置"
echo ""
echo "🔗 访问你的应用: https://augment-proxy-deck.your-subdomain.workers.dev"
echo ""
echo "📊 数据收集将自动开始:"
echo "  - 每日 00:05 UTC: 日报数据采集"
echo "  - 每 30 分钟: 车辆明细数据采集"
