/**
 * 数据库连接适配器
 * 支持本地SQLite和Cloudflare D1环境
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

// 环境检测
const isCloudflare = typeof globalThis.caches !== "undefined";

// 数据库连接类型
export type DatabaseConnection = ReturnType<typeof createDatabase>;

// 创建数据库连接
export function createDatabase(d1Database?: any) {
  if (isCloudflare && d1Database) {
    // Cloudflare D1环境
    return drizzleD1(d1Database, { schema });
  } else {
    // 本地SQLite环境 - 统一使用src/data/local.db
    const dbPath = path.join(process.cwd(), "src/data/local.db");

    console.log(`📁 Database path: ${dbPath}`);

    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite, { schema });

    // 自动运行迁移
    try {
      const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
      migrate(db, { migrationsFolder });
      console.log("✅ Database migrations applied successfully");
    } catch {
      console.log("ℹ️ No migrations to apply or migrations already applied");
    }

    return db;
  }
}

// 全局数据库实例（本地开发用）
let globalDb: DatabaseConnection | null = null;

export function getDatabase(d1Database?: any): DatabaseConnection {
  if (isCloudflare && d1Database) {
    return createDatabase(d1Database);
  }

  if (!globalDb) {
    globalDb = createDatabase();
  }

  return globalDb;
}
