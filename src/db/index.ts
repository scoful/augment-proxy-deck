/**
 * 数据库连接适配器
 * 支持本地SQLite、Cloudflare D1和Turso环境
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as migrateTurso } from "drizzle-orm/libsql/migrator";
import path from "path";

// 环境检测函数
function detectEnvironment() {
  // 检测 Cloudflare 环境
  const isCloudflare = typeof globalThis.caches !== "undefined";

  // 检测 Vercel 环境
  const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);

  return {
    isCloudflare,
    isVercel,
    isLocal: !isCloudflare && !isVercel,
  };
}

// 数据库连接类型
export type DatabaseConnection = ReturnType<typeof createDatabase>;

// 异步创建 Turso 数据库连接
async function createTursoDatabase() {
  console.log("🚀 Creating Turso database connection...");

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error(
      "TURSO_DATABASE_URL environment variable is required for Turso connection",
    );
  }

  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  const db = drizzleTurso(tursoClient, { schema });

  // 运行 Turso 迁移（异步）
  try {
    const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
    await migrateTurso(db, { migrationsFolder });
    console.log("✅ Turso database migrations applied successfully");
  } catch (error) {
    console.log("ℹ️ Turso migrations skipped:", error);
  }

  return db;
}

// 创建数据库连接
export function createDatabase(d1Database?: any) {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    // Cloudflare D1环境
    console.log("🌐 Using Cloudflare D1 database");
    return drizzleD1(d1Database, { schema });
  } else if (env.isVercel) {
    // Vercel + Turso环境 - 返回不带迁移的连接
    console.log("🚀 Using Turso database for Vercel deployment");

    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl) {
      throw new Error(
        "TURSO_DATABASE_URL environment variable is required for Vercel deployment",
      );
    }

    const tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    return drizzleTurso(tursoClient, { schema });
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
let globalTursoDb: DatabaseConnection | null = null;

export function getDatabase(d1Database?: any): DatabaseConnection {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    return createDatabase(d1Database);
  }

  // 对于 Vercel 环境，使用预初始化的 Turso 连接
  if (env.isVercel) {
    if (!globalTursoDb) {
      // 如果没有预初始化，创建一个不带迁移的连接
      console.warn(
        "⚠️ Turso database not pre-initialized, creating connection without migrations",
      );
      return createDatabase();
    }
    return globalTursoDb;
  }

  // 本地环境使用全局单例
  if (!globalDb) {
    globalDb = createDatabase();
  }

  return globalDb;
}

// 专门用于初始化 Turso 数据库（包含迁移）
export async function initializeTursoDatabase() {
  if (!globalTursoDb) {
    console.log("🚀 Initializing Turso database with migrations...");
    globalTursoDb = await createTursoDatabase();
  }
  return globalTursoDb;
}

// 预热数据库连接（在应用启动时调用）
export async function warmupDatabases() {
  const env = detectEnvironment();

  if (env.isVercel) {
    // 预初始化 Turso 连接
    await initializeTursoDatabase();
    console.log("✅ Turso database warmed up");
  } else if (!env.isCloudflare) {
    // 预热本地数据库
    getDatabase();
    console.log("✅ Local database warmed up");
  }
}
