/**
 * 数据采集核心逻辑
 * 支持本地SQLite和Cloudflare D1环境
 */

// Cloudflare D1 类型定义
interface D1Database {
  prepare(query: string): any;
  exec(query: string): Promise<any>;
}

// 使用与tRPC相同的数据库适配机制
// 在Vercel环境下，webpack会将@/server/api/trpc重定向到trpc-vercel.ts
// 我们可以通过导入tRPC context来获取正确的数据库连接
import * as dbSchema from "@/db/schema";
import {
  userStatsDetail,
  userStatsSummary,
  vehicleStatsDetail,
  vehicleStatsSummary,
  systemStatsDetail,
  systemStatsSummary,
  collectionLogs,
} from "@/db/schema";
import { getVehicleType } from "@/utils/vehicle-types";

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1秒
} as const;

// API端点配置
const API_ENDPOINTS = {
  USER_STATS: "https://proxy.poolhub.me/api/stats?limit=10000",
  CAR_STATS: "https://proxy.poolhub.me/api/car-stats",
  HOURLY_STATS: "https://proxy.poolhub.me/api/hourly-stats",
} as const;

/**
 * 统一获取数据库连接
 * - Cloudflare scheduled: 若传入 d1Database，则直接使用 D1 适配器（避免 Node API）
 * - 其他情况: 通过 tRPC 上下文获取（Vercel -> Turso / Cloudflare fetch -> D1 / 本地 -> SQLite）
 */
async function getDb(d1?: D1Database) {
  if (d1) {
    const { drizzle } = await import("drizzle-orm/d1");
    return drizzle(d1 as any, { schema: dbSchema });
  }
  const { createTRPCContext } = await import("@/server/api/trpc");
  const ctx = await Promise.resolve(createTRPCContext({} as any));
  return ctx.db;
}

/**
 * 带重试的API请求
 */
async function fetchWithRetry(
  url: string,
  retries = RETRY_CONFIG.maxRetries,
): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      console.warn(
        `API request failed (attempt ${i + 1}/${retries + 1}):`,
        error,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_CONFIG.retryDelay * (i + 1)),
      );
    }
  }
}

/**
 * 获取 UTC+8 时区的上一天日期 (YYYY-MM-DD)
 * 统一用于所有数据表的 dataDate 字段
 */
function getYesterdayDateUTC8(): string {
  const now = new Date();
  // 先转换为 UTC+8 同步时刻
  const utc8Now = new Date(
    now.getTime() + (now.getTimezoneOffset() + 480) * 60 * 1000,
  );
  // 回退一天，得到上一天（UTC+8）对应的日期
  const utc8Yesterday = new Date(utc8Now.getTime() - 24 * 60 * 60 * 1000);
  return utc8Yesterday.toISOString().split("T")[0]!;
}

/**
 * 采集用户统计数据 (明细 + 汇总)
 * 每日00:05执行
 */
export async function collectUserStats(_d1Database?: D1Database) {
  const startTime = Date.now();
  // 统一通过 getDb 获取数据库连接（优先使用传入的 D1）
  const db = await getDb(_d1Database);
  const dataDate = getYesterdayDateUTC8();

  try {
    console.log("🔄 开始采集用户统计数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.USER_STATS);

    // 准备用户明细数据
    const userDetails = data.allUsers.map((user: any) => ({
      userId: user.userId,
      displayName: user.displayName,
      count24Hour: user.count24Hour,
      rank24Hour: user.rank24Hour,
      dataDate,
    }));

    // 准备用户汇总数据
    const userSummaryData = {
      totalUsers24Hour: data.summary.totalUsers24Hour,
      totalCount24Hour: data.summary.totalCount24Hour,
      dataDate,
    };

    // 分批插入用户明细数据（D1 数据库批量插入限制）
    if (userDetails.length > 0) {
      const BATCH_SIZE = 10; // D1 数据库建议的批量插入大小

      for (let i = 0; i < userDetails.length; i += BATCH_SIZE) {
        const batch = userDetails.slice(i, i + BATCH_SIZE);
        await db.insert(userStatsDetail).values(batch);
        console.log(
          `📝 已插入用户明细数据批次: ${i + 1}-${Math.min(i + BATCH_SIZE, userDetails.length)} / ${userDetails.length}`,
        );
      }
    }

    // 插入用户汇总数据
    await db.insert(userStatsSummary).values(userSummaryData);

    // 记录成功日志
    await db.insert(collectionLogs).values({
      taskType: "user",
      status: "success",
      recordsCount: userDetails.length,
      executionTime: Date.now() - startTime,
    });

    console.log(`✅ 用户统计数据采集成功: ${userDetails.length} 条明细记录`);
    return { success: true, recordsCount: userDetails.length };
  } catch (error) {
    // 记录错误日志
    await db.insert(collectionLogs).values({
      taskType: "user",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
    });

    console.error("❌ 用户统计数据采集失败:", error);
    throw error;
  }
}

/**
 * 采集车辆统计汇总数据
 * 每日00:05执行
 */
export async function collectVehicleStatsSummary(_d1Database?: D1Database) {
  const startTime = Date.now();
  // 统一通过 getDb 获取数据库连接（优先使用传入的 D1）
  const db = await getDb(_d1Database);
  const dataDate = getYesterdayDateUTC8();

  try {
    console.log("🔄 开始采集车辆统计汇总数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.CAR_STATS);

    // 准备车辆汇总数据
    const vehicleSummaryData = {
      totalCars: data.summary.totalCars,
      activeCars: data.summary.activeCars,
      totalUsers: data.summary.totalUsers,
      totalCount24Hour: data.summary.totalCount24Hour,
      dataDate,
    };

    // 插入车辆汇总数据
    await db.insert(vehicleStatsSummary).values(vehicleSummaryData);

    // 记录成功日志
    await db.insert(collectionLogs).values({
      taskType: "vehicle_summary",
      status: "success",
      recordsCount: 1,
      executionTime: Date.now() - startTime,
    });

    console.log("✅ 车辆统计汇总数据采集成功");
    return { success: true, recordsCount: 1 };
  } catch (error) {
    // 记录错误日志
    await db.insert(collectionLogs).values({
      taskType: "vehicle_summary",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
    });

    console.error("❌ 车辆统计汇总数据采集失败:", error);
    throw error;
  }
}

/**
 * 采集车辆统计明细数据
 * 每日00:05执行（作为日报数据采集的一部分）
 */
export async function collectVehicleStatsDetail(_d1Database?: D1Database) {
  const startTime = Date.now();
  // 统一通过 getDb 获取数据库连接（优先使用传入的 D1）
  const db = await getDb(_d1Database);
  const dataDate = getYesterdayDateUTC8();

  try {
    console.log("🔄 开始采集车辆统计明细数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.CAR_STATS);

    // 准备车辆明细数据
    const vehicleDetails = data.cars.map((car: any) => ({
      carId: car.carId,
      currentUsers: car.currentUsers,
      maxUsers: car.maxUsers,
      count24Hour: car.count24Hour,
      isActive: car.isActive,
      carType: getVehicleType(car.maxUsers),
      dataDate: dataDate,
    }));

    // 分批插入车辆明细数据（D1 数据库批量插入限制）
    if (vehicleDetails.length > 0) {
      const BATCH_SIZE = 10; // D1 数据库建议的批量插入大小

      for (let i = 0; i < vehicleDetails.length; i += BATCH_SIZE) {
        const batch = vehicleDetails.slice(i, i + BATCH_SIZE);
        await db.insert(vehicleStatsDetail).values(batch);
        console.log(
          `📝 已插入车辆明细数据批次: ${i + 1}-${Math.min(i + BATCH_SIZE, vehicleDetails.length)} / ${vehicleDetails.length}`,
        );
      }
    }

    // 记录成功日志
    await db.insert(collectionLogs).values({
      taskType: "vehicle_detail",
      status: "success",
      recordsCount: vehicleDetails.length,
      executionTime: Date.now() - startTime,
    });

    console.log(`✅ 车辆统计明细数据采集成功: ${vehicleDetails.length} 条记录`);
    return { success: true, recordsCount: vehicleDetails.length };
  } catch (error) {
    // 记录错误日志
    await db.insert(collectionLogs).values({
      taskType: "vehicle_detail",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
    });

    console.error("❌ 车辆统计明细数据采集失败:", error);
    throw error;
  }
}

/**
 * 采集系统统计数据 (明细 + 汇总)
 * 每日00:05执行，获取昨日完整数据
 */
export async function collectSystemStats(_d1Database?: D1Database) {
  const startTime = Date.now();
  // 统一通过 getDb 获取数据库连接（优先使用传入的 D1）
  const db = await getDb(_d1Database);
  const dataDate = getYesterdayDateUTC8();

  try {
    console.log("🔄 开始采集系统统计数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.HOURLY_STATS);

    // 准备系统明细数据 (yesterday字段)
    const systemDetails = data.yesterday.map((hourData: any) => ({
      hourTimestamp: hourData.hour,
      requestCount: hourData.count,
      dataDate,
    }));

    // 准备系统汇总数据
    const systemSummaryData = {
      todayTotal: data.summary.todayTotal,
      yesterdayTotal: data.summary.yesterdayTotal,
      todayUsers: data.summary.todayUsers,
      yesterdayUsers: data.summary.yesterdayUsers,
      dataDate,
    };

    // 分批插入系统明细数据（D1 数据库批量插入限制）
    if (systemDetails.length > 0) {
      const BATCH_SIZE = 10; // D1 数据库建议的批量插入大小

      for (let i = 0; i < systemDetails.length; i += BATCH_SIZE) {
        const batch = systemDetails.slice(i, i + BATCH_SIZE);
        await db.insert(systemStatsDetail).values(batch);
        console.log(
          `📝 已插入系统明细数据批次: ${i + 1}-${Math.min(i + BATCH_SIZE, systemDetails.length)} / ${systemDetails.length}`,
        );
      }
    }

    // 插入系统汇总数据
    await db.insert(systemStatsSummary).values(systemSummaryData);

    // 记录成功日志
    await db.insert(collectionLogs).values({
      taskType: "system",
      status: "success",
      recordsCount: systemDetails.length,
      executionTime: Date.now() - startTime,
    });

    console.log(`✅ 系统统计数据采集成功: ${systemDetails.length} 条明细记录`);
    return { success: true, recordsCount: systemDetails.length };
  } catch (error) {
    // 记录错误日志
    await db.insert(collectionLogs).values({
      taskType: "system",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
    });

    console.error("❌ 系统统计数据采集失败:", error);
    throw error;
  }
}

/**
 * 执行每日数据采集任务
 * 统一在00:05执行所有日报数据采集
 */
export async function collectDailyStats(d1Database?: D1Database) {
  console.log("🌅 开始执行每日数据采集任务...");

  const results = {
    user: null as any,
    vehicleSummary: null as any,
    vehicleDetail: null as any,
    system: null as any,
    errors: [] as string[],
  };

  // 依次执行各项采集任务
  try {
    results.user = await collectUserStats(d1Database);
  } catch (error) {
    results.errors.push(
      `用户数据采集失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    results.vehicleSummary = await collectVehicleStatsSummary(d1Database);
  } catch (error) {
    results.errors.push(
      `车辆汇总数据采集失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    results.vehicleDetail = await collectVehicleStatsDetail(d1Database);
  } catch (error) {
    results.errors.push(
      `车辆明细数据采集失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    results.system = await collectSystemStats(d1Database);
  } catch (error) {
    results.errors.push(
      `系统数据采集失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  // 输出采集结果
  const successCount = [
    results.user,
    results.vehicleSummary,
    results.vehicleDetail,
    results.system,
  ].filter(Boolean).length;
  const totalTasks = 4;

  if (results.errors.length === 0) {
    console.log(`🎉 每日数据采集完成! 成功: ${successCount}/${totalTasks}`);
  } else {
    console.warn(
      `⚠️ 每日数据采集部分失败! 成功: ${successCount}/${totalTasks}, 错误: ${results.errors.length}`,
    );
    results.errors.forEach((error) => console.error(`  - ${error}`));
  }

  return results;
}
