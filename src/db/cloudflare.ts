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

// 创建数据库连接（支持 Cloudflare D1、Vercel Turso 和本地 SQLite）
export function createDatabase(d1Database?: any) {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    // Cloudflare D1环境
    console.log("🌐 Using Cloudflare D1 database");
    return drizzleD1(d1Database, { schema });
  } else if (env.isVercel) {
    // Vercel 环境：抛出错误，要求使用预初始化的 Turso 连接
    throw new Error(
      "Vercel environment detected. Please use the pre-initialized Turso database connection from the global cache.",
    );
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

// 异步创建 Turso 数据库连接（仅在 Vercel 环境中使用）
async function createTursoDatabase() {
  console.log("🚀 Creating Turso database connection...");

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error(
      "TURSO_DATABASE_URL environment variable is required for Turso connection",
    );
  }

  // 动态导入 Turso 相关模块
  const { drizzle: drizzleTurso } = await import("drizzle-orm/libsql");
  const { createClient } = await import("@libsql/client");
  const { migrate: migrateTurso } = await import("drizzle-orm/libsql/migrator");

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

// 初始化 Turso 数据库（仅在 Vercel 环境中使用）
export async function initializeTursoDatabase() {
  if (!globalTursoDb) {
    console.log("🚀 Initializing Turso database with migrations...");
    globalTursoDb = await createTursoDatabase();
  }
  return globalTursoDb;
}

export function getDatabase(d1Database?: any): DatabaseConnection {
  const env = detectEnvironment();

  if (env.isCloudflare && d1Database) {
    return createDatabase(d1Database);
  }

  if (env.isVercel) {
    // Vercel 环境：如果 Turso 没有初始化，尝试同步创建
    if (!globalTursoDb) {
      console.warn(
        "⚠️ Turso database not pre-initialized, creating synchronously...",
      );

      // 同步创建 Turso 连接（不包含迁移）
      const tursoUrl = process.env.TURSO_DATABASE_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN;

      if (!tursoUrl) {
        throw new Error(
          "TURSO_DATABASE_URL environment variable is required for Vercel deployment",
        );
      }

      try {
        // 使用 eval + require 避免构建时依赖解析
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-eval
        const drizzleLibsql = eval('require("drizzle-orm/libsql")');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-eval
        const libsqlClient = eval('require("@libsql/client")');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const drizzleTurso = drizzleLibsql.drizzle;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const createClient = libsqlClient.createClient;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const tursoClient = createClient({
          url: tursoUrl,
          authToken: tursoToken,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        globalTursoDb = drizzleTurso(tursoClient, { schema });
        console.log("✅ Turso database created synchronously");
      } catch (error) {
        console.error("❌ Failed to load Turso dependencies:", error);
        // 回退到本地 SQLite
        console.warn("⚠️ Falling back to local SQLite");
        if (!globalDb) {
          globalDb = createDatabase();
        }
        return globalDb;
      }
    }

    // TypeScript 类型保护：确保 globalTursoDb 不为 null
    if (!globalTursoDb) {
      throw new Error("Failed to initialize Turso database");
    }

    return globalTursoDb;
  }

  // 本地环境使用全局单例
  if (!globalDb) {
    globalDb = createDatabase();
  }

  return globalDb;
}
