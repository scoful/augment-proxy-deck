/**
 * 数据采集核心逻辑
 * 支持本地SQLite和Cloudflare D1环境
 */
import { getDatabase } from "@/db";
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
 * 获取昨日日期字符串 (YYYY-MM-DD)
 */
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0]!;
}

/**
 * 采集用户统计数据 (明细 + 汇总)
 * 每日00:05执行
 */
export async function collectUserStats(d1Database?: D1Database) {
  const startTime = Date.now();
  const db = getDatabase(d1Database);
  const dataDate = getYesterdayDate();

  try {
    console.log("🔄 开始采集用户统计数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.USER_STATS);

    // 准备用户明细数据
    const userDetails = data.allUsers.map((user: any) => ({
      userId: user.userId,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      count1Hour: user.count1Hour,
      count24Hour: user.count24Hour,
      rank1Hour: user.rank1Hour,
      rank24Hour: user.rank24Hour,
      dataDate,
    }));

    // 准备用户汇总数据
    const userSummaryData = {
      totalUsers1Hour: data.summary.totalUsers1Hour,
      totalUsers24Hour: data.summary.totalUsers24Hour,
      totalCount1Hour: data.summary.totalCount1Hour,
      totalCount24Hour: data.summary.totalCount24Hour,
      dataDate,
    };

    // 批量插入用户明细数据
    if (userDetails.length > 0) {
      await db.insert(userStatsDetail).values(userDetails);
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
export async function collectVehicleStatsSummary(d1Database?: D1Database) {
  const startTime = Date.now();
  const db = getDatabase(d1Database);
  const dataDate = getYesterdayDate();

  try {
    console.log("🔄 开始采集车辆统计汇总数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.CAR_STATS);

    // 准备车辆汇总数据
    const vehicleSummaryData = {
      totalCars: data.summary.totalCars,
      activeCars: data.summary.activeCars,
      totalUsers: data.summary.totalUsers,
      totalCount1Hour: data.summary.totalCount1Hour,
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
 * 每30分钟执行
 */
export async function collectVehicleStatsDetail(d1Database?: D1Database) {
  const startTime = Date.now();
  const db = getDatabase(d1Database);

  try {
    console.log("🔄 开始采集车辆统计明细数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.CAR_STATS);

    // 准备车辆明细数据
    const vehicleDetails = data.cars.map((car: any) => ({
      carId: car.carId,
      userEmail: car.userEmail,
      targetUrl: car.targetUrl,
      currentUsers: car.currentUsers,
      maxUsers: car.maxUsers,
      count1Hour: car.count1Hour,
      count24Hour: car.count24Hour,
      isActive: car.isActive,
      carType: getVehicleType(car.maxUsers),
    }));

    // 批量插入车辆明细数据
    if (vehicleDetails.length > 0) {
      await db.insert(vehicleStatsDetail).values(vehicleDetails);
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
export async function collectSystemStats(d1Database?: D1Database) {
  const startTime = Date.now();
  const db = getDatabase(d1Database);
  const dataDate = getYesterdayDate();

  try {
    console.log("🔄 开始采集系统统计数据...");

    // 获取API数据
    const data = await fetchWithRetry(API_ENDPOINTS.HOURLY_STATS);

    // 准备系统明细数据 (yesterday字段)
    const systemDetails = data.yesterday.map((hourData: any) => ({
      hourTimestamp: hourData.hour,
      requestCount: hourData.count,
      uniqueUsers: hourData.uniqueUsers,
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

    // 批量插入系统明细数据
    if (systemDetails.length > 0) {
      await db.insert(systemStatsDetail).values(systemDetails);
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
    results.system,
  ].filter(Boolean).length;
  const totalTasks = 3;

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
