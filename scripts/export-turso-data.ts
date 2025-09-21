#!/usr/bin/env tsx

/**
 * Turso 数据导出脚本
 * 全量导出 Turso 数据为 SQL 格式
 *
 * 使用方法:
 * pnpm run export:turso-sql
 */

import { createClient } from "@libsql/client";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { config } from "dotenv";

// 加载环境变量
config();

// 表名列表（按照 schema.ts 中的定义）
const TABLES = [
  "user_stats_detail",
  "user_stats_summary",
  "vehicle_stats_detail",
  "vehicle_stats_summary",
  "system_stats_detail",
  "system_stats_summary",
  "collection_logs",
] as const;

/**
 * 创建 Turso 客户端连接
 */
function createTursoClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error("TURSO_DATABASE_URL environment variable is required");
  }

  console.log("🔗 Connecting to Turso database...");
  return createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
}

/**
 * 获取表的结构信息
 */
async function getTableSchema(client: any, tableName: string) {
  const result = await client.execute(`PRAGMA table_info(${tableName})`);
  return result.rows;
}

/**
 * 获取表的所有数据
 */
async function getTableData(client: any, tableName: string) {
  console.log(`📊 Exporting table: ${tableName}`);
  const result = await client.execute(`SELECT * FROM ${tableName} ORDER BY id`);
  console.log(`   └─ Found ${result.rows.length} records`);
  return result.rows;
}

/**
 * 转义 SQL 值
 */
function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`; // 转义单引号
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0"; // SQLite 布尔值
  }
  return String(value);
}

/**
 * 导出 Turso 数据为 SQL 格式
 */
async function exportTursoToSQL(client: any, outputFile: string) {
  let sqlContent = `-- Turso Database Export
-- Generated at: ${new Date().toISOString()}
-- Source: Turso Database

`;

  let totalRecords = 0;

  for (const tableName of TABLES) {
    try {
      console.log(`📊 Processing table: ${tableName}`);

      // 获取表结构
      const schema = await getTableSchema(client, tableName);
      const columns = schema.map((col: any) => col.name);

      // 获取数据
      const data = await getTableData(client, tableName);

      if (data.length === 0) {
        sqlContent += `-- Table ${tableName} is empty\n\n`;
        continue;
      }

      sqlContent += `-- ========================================\n`;
      sqlContent += `-- Data for table: ${tableName}\n`;
      sqlContent += `-- Records: ${data.length}\n`;
      sqlContent += `-- ========================================\n\n`;

      for (const row of data) {
        const values = columns
          .map((col: string) => {
            const value = (row as any)[col];
            return escapeSqlValue(value);
          })
          .join(", ");

        sqlContent += `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values});\n`;
      }

      sqlContent += "\n";
      totalRecords += data.length;
    } catch (error) {
      console.warn(`⚠️  Failed to process table ${tableName}:`, error);
      sqlContent += `-- ERROR: Failed to process table ${tableName}: ${error}\n\n`;
    }
  }

  sqlContent += `-- ========================================\n`;
  sqlContent += `-- Export Summary\n`;
  sqlContent += `-- Total records: ${totalRecords}\n`;
  sqlContent += `-- Tables processed: ${TABLES.length}\n`;
  sqlContent += `-- Generated at: ${new Date().toISOString()}\n`;
  sqlContent += `-- ========================================\n`;

  // 确保输出目录存在
  mkdirSync(dirname(outputFile), { recursive: true });

  // 写入文件
  writeFileSync(outputFile, sqlContent, "utf8");
  console.log(`✅ Turso SQL export completed: ${outputFile}`);
  console.log(
    `📈 Export summary: ${totalRecords} total records across ${TABLES.length} tables`,
  );

  return { totalRecords, outputFile };
}

/**
 * 主函数
 */
async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = `./exports/turso-export-${timestamp}.sql`;

  console.log(`🚀 Starting Turso data export...`);
  console.log(`   Output: ${resolve(outputFile)}`);
  console.log("");

  try {
    const client = createTursoClient();

    // 导出 Turso 数据为 SQL
    await exportTursoToSQL(client, outputFile);

    console.log("");
    console.log("🎉 Turso data export completed successfully!");
    console.log("");
    console.log("📋 Generated file:");
    console.log(`   ${outputFile}`);
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
