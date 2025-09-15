#!/usr/bin/env tsx
/**
 * 测试 Turso 数据库连接
 * 用于验证 Turso 配置是否正确
 */

// 加载环境变量
import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";

async function testTursoConnection() {
  console.log("🧪 Testing Turso database connection...");

  // 检查环境变量
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error("❌ TURSO_DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${tursoUrl}`);
  console.log(
    `🔑 Auth token: ${tursoToken ? "✅ Provided" : "⚠️ Not provided"}`,
  );

  try {
    // 创建 Turso 客户端
    const tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // 创建 Drizzle 实例
    const db = drizzle(tursoClient, { schema });

    // 测试基本连接
    console.log("🔍 Testing basic connection...");
    const result = await tursoClient.execute("SELECT 1 as test");
    console.log("✅ Basic connection successful:", result);

    // 测试表查询（如果表存在）
    try {
      console.log("🔍 Testing schema access...");
      const tables = await tursoClient.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      console.log("📊 Available tables:", tables.rows);

      // 如果有表，尝试查询一个
      if (tables.rows.length > 0) {
        const tableName = tables.rows[0]?.name as string;
        console.log(`🔍 Testing query on table: ${tableName}`);
        const testQuery = await tursoClient.execute(
          `SELECT COUNT(*) as count FROM ${tableName}`,
        );
        console.log(`✅ Query successful:`, testQuery.rows);
      }
    } catch (error) {
      console.log("ℹ️ Schema test skipped (tables may not exist yet):", error);
    }

    console.log("🎉 Turso connection test completed successfully!");
  } catch (error) {
    console.error("❌ Turso connection test failed:", error);
    process.exit(1);
  }
}

// 运行测试
testTursoConnection().catch(console.error);
