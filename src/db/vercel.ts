import path from "path";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

type DatabaseConnection = ReturnType<typeof drizzle<typeof schema>>;

// 全局 Turso 数据库实例
let globalTursoDb: DatabaseConnection | null = null;

// 环境检测
function detectEnvironment() {
  const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
  return { isVercel };
}

// 创建 Turso 数据库连接
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

  const db = drizzle(tursoClient, { schema });

  // 运行 Turso 迁移（异步）
  try {
    const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
    await migrate(db, { migrationsFolder });
    console.log("✅ Turso database migrations applied successfully");
  } catch (error) {
    console.log("ℹ️ Turso migrations skipped:", error);
  }

  return db;
}

// 同步创建 Turso 数据库连接（用于请求时初始化）
function createTursoDatabaseSync() {
  console.log("🚀 Creating Turso database connection synchronously...");

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

  const db = drizzle(tursoClient, { schema });
  console.log("✅ Turso database created synchronously");

  return db;
}

// 初始化 Turso 数据库（异步）
export async function initializeTursoDatabase() {
  if (!globalTursoDb) {
    console.log("🚀 Initializing Turso database with migrations...");
    globalTursoDb = await createTursoDatabase();
    console.log("✅ Turso database initialized successfully");
  }
  return globalTursoDb;
}

// 获取数据库连接（Vercel 专用）
export function getDatabase(): DatabaseConnection {
  const env = detectEnvironment();

  if (!env.isVercel) {
    throw new Error("This database module is only for Vercel environment");
  }

  // 如果 Turso 没有初始化，尝试同步创建
  if (!globalTursoDb) {
    console.warn(
      "⚠️ Turso database not pre-initialized, creating synchronously...",
    );
    globalTursoDb = createTursoDatabaseSync();
  }

  return globalTursoDb;
}

// 预热数据库连接
export async function warmupDatabases() {
  console.log("🔥 Warming up Vercel databases...");

  try {
    await initializeTursoDatabase();
    console.log("✅ Vercel database warmup completed");
  } catch (error) {
    console.error("❌ Vercel database warmup failed:", error);
  }
}
