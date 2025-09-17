/**
 * Cloudflare 专用数据库连接
 * 只支持 Cloudflare D1，避免 Turso 相关依赖
 */
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

// 环境检测函数
function detectEnvironment() {
  // 检测 Cloudflare 环境
  const isCloudflare = typeof globalThis.caches !== "undefined";
  
  return {
    isCloudflare,
    isLocal: !isCloudflare,
  };
}

// 数据库连接类型
export type DatabaseConnection = ReturnType<typeof createDatabase>;

// 创建数据库连接（仅支持 Cloudflare D1 和本地 SQLite）
export function createDatabase(d1Database?: any) {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    // Cloudflare D1环境
    console.log("🌐 Using Cloudflare D1 database");
    return drizzleD1(d1Database, { schema });
  } else {
    // 本地SQLite环境 - 统一使用src/data/local.db
    console.log("💻 Using local SQLite database");
    const dbPath = path.join(process.cwd(), "src/data/local.db");

    console.log(`📁 Database path: ${dbPath}`);

    // 创建优化的SQLite连接
    const sqlite = new Database(dbPath, {
      // 启用WAL模式以提高并发性能
      fileMustExist: false,
      timeout: 5000,
      verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
    });

    // 应用性能优化设置
    sqlite.pragma("journal_mode = WAL"); // 启用WAL模式
    sqlite.pragma("synchronous = NORMAL"); // 平衡安全性和性能
    sqlite.pragma("cache_size = 1000000"); // 1GB缓存
    sqlite.pragma("foreign_keys = ON"); // 启用外键约束
    sqlite.pragma("temp_store = MEMORY"); // 临时表存储在内存中

    const db = drizzle(sqlite, { schema });

    // 自动运行迁移
    try {
      const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
      migrate(db, { migrationsFolder });
      console.log("✅ Database migrations applied successfully");
    } catch {
      console.log("ℹ️ No migrations to apply or migrations already applied");
    }

    // 预热数据库连接
    try {
      sqlite.prepare("SELECT 1").get();
      console.log("🔥 Database connection warmed up");
    } catch (error) {
      console.warn("⚠️ Database warmup failed:", error);
    }

    return db;
  }
}

// 全局数据库实例
let globalDb: DatabaseConnection | null = null;

export function getDatabase(d1Database?: any): DatabaseConnection {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    return createDatabase(d1Database);
  }

  // 本地环境使用全局单例
  if (!globalDb) {
    globalDb = createDatabase();
  }

  return globalDb;
}
