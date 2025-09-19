/**
 * 历史数据查询API路由
 * 提供各种历史数据分析和趋势查询
 */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  userStatsDetail,
  userStatsSummary,
  vehicleStatsDetail,
  vehicleStatsSummary,
  systemStatsDetail,
  systemStatsSummary,
  collectionLogs,
} from "@/db/schema";
import { desc, asc, eq, gte, and, like, or } from "drizzle-orm";
import {
  collectDailyStats,
  collectVehicleStatsDetail,
  collectUserStats,
  collectVehicleStatsSummary,
  collectSystemStats,
} from "@/lib/data-collector";

export const historyRouter = createTRPCRouter({
  // 获取用户活跃度趋势
  getUserActivityTrends: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      if (input.userId) {
        // 查询特定用户的趋势
        return await ctx.db
          .select()
          .from(userStatsDetail)
          .where(
            and(
              eq(userStatsDetail.userId, input.userId),
              gte(userStatsDetail.dataDate, startDate),
            ),
          )
          .orderBy(asc(userStatsDetail.dataDate));
      } else {
        // 查询整体用户活跃度趋势
        return await ctx.db
          .select()
          .from(userStatsSummary)
          .where(gte(userStatsSummary.dataDate, startDate))
          .orderBy(asc(userStatsSummary.dataDate));
      }
    }),

  // 获取车辆存活率趋势
  getVehicleSurvivalTrends: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
        carType: z.enum(["all", "social", "black"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      return await ctx.db
        .select()
        .from(vehicleStatsSummary)
        .where(gte(vehicleStatsSummary.dataDate, startDate))
        .orderBy(asc(vehicleStatsSummary.dataDate));
    }),

  // 获取社车vs黑车对比数据
  getSocialVsBlackComparison: publicProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      // 从明细数据中按日期和车型聚合
      return await ctx.db
        .select()
        .from(vehicleStatsDetail)
        .where(gte(vehicleStatsDetail.recordedAt, startDate))
        .orderBy(asc(vehicleStatsDetail.recordedAt));
    }),

  // 获取系统请求量趋势（包含峰值数据）
  getSystemRequestTrends: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      // 获取系统汇总数据（总量）
      const summaryData = await ctx.db
        .select()
        .from(systemStatsSummary)
        .where(gte(systemStatsSummary.dataDate, startDate))
        .orderBy(asc(systemStatsSummary.dataDate));

      // 获取系统明细数据（用于计算峰值）
      const detailData = await ctx.db
        .select()
        .from(systemStatsDetail)
        .where(gte(systemStatsDetail.dataDate, startDate))
        .orderBy(asc(systemStatsDetail.dataDate));

      // 按日期分组计算每日峰值
      const dailyPeaks = new Map<string, number>();
      detailData.forEach((record) => {
        const date = record.dataDate;
        const currentPeak = dailyPeaks.get(date) || 0;
        if (record.requestCount > currentPeak) {
          dailyPeaks.set(date, record.requestCount);
        }
      });

      // 合并汇总数据和峰值数据
      const result = summaryData.map((summary) => ({
        ...summary,
        dailyPeak: dailyPeaks.get(summary.dataDate) || 0,
      }));

      return result;
    }),

  // 获取按小时请求分布（热力图数据）
  getHourlyRequestDistribution: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      return await ctx.db
        .select()
        .from(systemStatsDetail)
        .where(gte(systemStatsDetail.dataDate, startDate))
        .orderBy(asc(systemStatsDetail.dataDate));
    }),

  // 获取数据采集日志
  getCollectionLogs: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        taskType: z
          .enum(["user", "vehicle_detail", "vehicle_summary", "system"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.taskType) {
        return await ctx.db
          .select()
          .from(collectionLogs)
          .where(eq(collectionLogs.taskType, input.taskType))
          .orderBy(desc(collectionLogs.recordedAt))
          .limit(input.limit);
      } else {
        return await ctx.db
          .select()
          .from(collectionLogs)
          .orderBy(desc(collectionLogs.recordedAt))
          .limit(input.limit);
      }
    }),

  // 手动触发数据采集（开发和测试用）
  triggerDataCollection: publicProcedure
    .input(
      z.object({
        type: z.enum(["daily", "user", "vehicle_summary", "system"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // 在生产环境中，通过 HTTP 请求调用手动触发端点
        // 这样可以确保使用与 cron trigger 完全相同的逻辑
        const response = await fetch("/api/manual-trigger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: input.type,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        const result = await response.json();
        return result;
      } catch (error) {
        // 如果 HTTP 请求失败，回退到直接调用数据采集函数
        console.warn("HTTP 触发失败，回退到直接调用:", error);

        // 获取 D1 数据库实例 - 需要从 Cloudflare Workers 环境中获取
        let d1Database;
        try {
          // 在 Cloudflare Workers 环境中获取 D1 绑定
          const { getCloudflareContext } = await import(
            "@opennextjs/cloudflare"
          );
          const cloudflareContext = getCloudflareContext(); // 同步调用
          d1Database = cloudflareContext.env?.DB;
        } catch {
          // 在本地开发环境中，使用默认的本地数据库
          d1Database = undefined;
        }

        switch (input.type) {
          case "daily":
            return await collectDailyStats(d1Database);
          case "user":
            return await collectUserStats(d1Database);
          case "vehicle_summary":
            return await collectVehicleStatsSummary(d1Database);
          case "system":
            return await collectSystemStats(d1Database);
          default:
            throw new Error("Invalid collection type");
        }
      }
    }),

  // 获取用户活跃度分布统计
  getUserActivityDistribution: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      // 获取用户数据
      const rawResults = await ctx.db
        .select()
        .from(userStatsDetail)
        .where(gte(userStatsDetail.dataDate, startDate));

      // 计算每个用户的平均日请求量
      const userMap = new Map();
      for (const record of rawResults) {
        const userId = record.userId;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            totalCount: record.count24Hour,
            recordCount: 1,
          });
        } else {
          const existing = userMap.get(userId);
          existing.totalCount += record.count24Hour;
          existing.recordCount += 1;
        }
      }

      // 计算平均值并分类
      const distribution = {
        超重度用户: 0, // ≥200
        重度用户: 0, // 100-199
        中度用户: 0, // 50-99
        轻度用户: 0, // 10-49
        偶尔使用: 0, // <10
      };

      for (const [userId, data] of userMap) {
        const avgCount = data.totalCount / data.recordCount;

        if (avgCount >= 200) {
          distribution.超重度用户++;
        } else if (avgCount >= 100) {
          distribution.重度用户++;
        } else if (avgCount >= 50) {
          distribution.中度用户++;
        } else if (avgCount >= 10) {
          distribution.轻度用户++;
        } else {
          distribution.偶尔使用++;
        }
      }

      return distribution;
    }),

  // 获取用户行为变化率检测数据
  getUserBehaviorAnomalies: publicProcedure
    .input(z.object({ days: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const totalDays = input.days;
      const halfDays = Math.floor(totalDays / 2);

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - totalDays);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      const midDate = new Date();
      midDate.setDate(midDate.getDate() - halfDays);
      const midDateStr = midDate.toISOString().split("T")[0]!;

      // 获取指定天数内的用户数据
      const userData = await ctx.db
        .select()
        .from(userStatsDetail)
        .where(gte(userStatsDetail.dataDate, startDate))
        .orderBy(asc(userStatsDetail.dataDate));

      // 按用户ID和时间段分组计算
      const userMap = new Map<
        string,
        {
          userId: string;
          displayName: string;
          recentAvg: number;
          previousAvg: number;
          recentDays: number;
          previousDays: number;
          changeRate: number;
          totalRequests: number;
        }
      >();

      userData.forEach((record) => {
        const userId = record.userId;
        const isRecent = record.dataDate >= midDateStr;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId: record.userId,
            displayName: record.displayName,
            recentAvg: isRecent ? record.count24Hour : 0,
            previousAvg: isRecent ? 0 : record.count24Hour,
            recentDays: isRecent ? 1 : 0,
            previousDays: isRecent ? 0 : 1,
            changeRate: 0,
            totalRequests: record.count24Hour,
          });
        } else {
          const existing = userMap.get(userId)!;
          existing.totalRequests += record.count24Hour;

          if (isRecent) {
            existing.recentAvg = (existing.recentAvg * existing.recentDays + record.count24Hour) / (existing.recentDays + 1);
            existing.recentDays += 1;
          } else {
            existing.previousAvg = (existing.previousAvg * existing.previousDays + record.count24Hour) / (existing.previousDays + 1);
            existing.previousDays += 1;
          }
        }
      });

      // 计算变化率并过滤有效用户
      const allUsers = Array.from(userMap.values());
      const validUsers = allUsers.filter(user => user.recentDays > 0 && user.previousDays > 0);

      // 如果有效用户太少，降低要求：只要有任一时间段数据即可
      const users = validUsers.length < 5
        ? allUsers
            .filter(user => user.recentDays > 0 || user.previousDays > 0)
            .map(user => {
              // 如果只有一个时间段有数据，变化率设为0或基于单一数据计算
              let changeRate = 0;
              if (user.previousDays > 0 && user.recentDays > 0) {
                changeRate = ((user.recentAvg - user.previousAvg) / user.previousAvg) * 100;
              } else if (user.recentDays > 0 && user.previousDays === 0) {
                changeRate = 100; // 新用户，视为100%增长
              } else if (user.previousDays > 0 && user.recentDays === 0) {
                changeRate = -100; // 用户消失，视为-100%
              }

              return {
                ...user,
                changeRate,
                avgDailyRequests: user.recentDays > 0 ? user.recentAvg : user.previousAvg,
              };
            })
        : validUsers.map(user => {
            const changeRate = user.previousAvg > 0
              ? ((user.recentAvg - user.previousAvg) / user.previousAvg) * 100
              : 0;

            return {
              ...user,
              changeRate,
              avgDailyRequests: (user.recentAvg + user.previousAvg) / 2,
            };
          });

      // 计算变化率的统计信息
      const changeRates = users.map(u => u.changeRate);
      const mean = changeRates.reduce((sum, val) => sum + val, 0) / changeRates.length;
      const variance = changeRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changeRates.length;
      const stdDev = Math.sqrt(variance);

      // 标记突发增长用户（变化率超过2个标准差且为正增长）
      const surgeThreshold = mean + 2 * stdDev;
      const extremeSurgeThreshold = mean + 3 * stdDev;

      const result = users.map(user => ({
        ...user,
        isSurge: user.changeRate > surgeThreshold && user.changeRate > 50, // 至少50%增长
        zScore: (user.changeRate - mean) / stdDev,
        surgeLevel: user.changeRate > extremeSurgeThreshold && user.changeRate > 100 ? 'extreme' :
                   user.changeRate > surgeThreshold && user.changeRate > 50 ? 'moderate' : 'normal'
      }));

      return {
        users: result,
        statistics: {
          mean,
          stdDev,
          surgeThreshold,
          totalUsers: users.length,
          surgeCount: result.filter(u => u.isSurge).length,
          timeRange: {
            recentDays: halfDays,
            previousDays: halfDays,
            totalDays
          }
        }
      };
    }),

  // 获取活跃用户列表
  getActiveUserList: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(500).default(100), // 支持更多用户，最大500
        days: z.number().default(7),
        search: z.string().optional(), // 搜索关键词
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      // 构建查询条件
      const whereConditions = [gte(userStatsDetail.dataDate, startDate)];

      // 如果有搜索关键词，添加搜索条件
      if (input.search?.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        whereConditions.push(
          or(
            like(userStatsDetail.displayName, searchTerm),
            like(userStatsDetail.userId, searchTerm),
          )!,
        );
      }

      // 获取活跃用户列表，按24小时请求量排序
      const rawResults = await ctx.db
        .select()
        .from(userStatsDetail)
        .where(and(...whereConditions))
        .orderBy(desc(userStatsDetail.count24Hour));

      // 前端去重并聚合
      const userMap = new Map();
      for (const record of rawResults) {
        const userId = record.userId;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId: record.userId,
            displayName: record.displayName,
            totalCount: record.count24Hour,
            avgCount: record.count24Hour,
            lastActiveDate: record.dataDate,
            recordCount: 1,
          });
        } else {
          const existing = userMap.get(userId);
          existing.totalCount += record.count24Hour;
          existing.recordCount += 1;
          existing.avgCount =
            Math.round((existing.totalCount / existing.recordCount) * 100) /
            100;
          if (record.dataDate > existing.lastActiveDate) {
            existing.lastActiveDate = record.dataDate;
          }
        }
      }

      // 转换为数组并按总量排序，限制结果数量
      return Array.from(userMap.values())
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, input.limit);
    }),

  // 获取数据统计概览
  getDataOverview: publicProcedure.query(async ({ ctx }) => {
    // 获取最新的数据日期
    const latestUserData = await ctx.db
      .select()
      .from(userStatsSummary)
      .orderBy(desc(userStatsSummary.dataDate))
      .limit(1);

    const latestVehicleData = await ctx.db
      .select()
      .from(vehicleStatsSummary)
      .orderBy(desc(vehicleStatsSummary.dataDate))
      .limit(1);

    const latestSystemData = await ctx.db
      .select()
      .from(systemStatsSummary)
      .orderBy(desc(systemStatsSummary.dataDate))
      .limit(1);

    // 计算累计系统总请求数 - 使用所有历史数据的yesterdayTotal字段
    const allSystemData = await ctx.db
      .select()
      .from(systemStatsSummary)
      .orderBy(asc(systemStatsSummary.dataDate));

    const totalSystemRequests = allSystemData.reduce(
      (sum, record) => sum + record.yesterdayTotal,
      0,
    );

    // 获取系统统计开始日期（最早的数据日期）
    const systemStartDate =
      allSystemData.length > 0 ? allSystemData[0]?.dataDate : null;

    // 计算系统用量峰值（前三高单日请求量）
    const systemUsageValues = allSystemData
      .map((record) => record.yesterdayTotal)
      .sort((a, b) => b - a); // 降序排列

    const systemPeakUsage = systemUsageValues[0] || 0;
    const systemSecondPeak = systemUsageValues[1] || 0;
    const systemThirdPeak = systemUsageValues[2] || 0;

    // 计算日活跃用户峰值（前三高单日活跃用户数）
    const dailyUsersValues = allSystemData
      .map((record) => record.yesterdayUsers)
      .sort((a, b) => b - a); // 降序排列

    const dailyActiveUsersPeak = dailyUsersValues[0] || 0;
    const dailyActiveUsersSecond = dailyUsersValues[1] || 0;
    const dailyActiveUsersThird = dailyUsersValues[2] || 0;

    // 获取数据量统计 - 使用简单查询获取记录数
    const userDetailRecords = await ctx.db.select().from(userStatsDetail);
    const vehicleDetailRecords = await ctx.db.select().from(vehicleStatsDetail);
    const systemDetailRecords = await ctx.db.select().from(systemStatsDetail);

    return {
      latestDates: {
        user: latestUserData[0]?.dataDate || null,
        vehicle: latestVehicleData[0]?.dataDate || null,
        system: latestSystemData[0]?.dataDate || null,
      },
      recordCounts: {
        userDetail: userDetailRecords.length,
        vehicleDetail: vehicleDetailRecords.length,
        systemDetail: systemDetailRecords.length,
      },
      totalSystemRequests, // 累计系统总请求数
      systemStartDate, // 系统统计开始日期
      systemPeakUsage, // 系统用量峰值
      systemSecondPeak, // 系统用量第二高
      systemThirdPeak, // 系统用量第三高
      dailyActiveUsersPeak, // 日活跃用户峰值
      dailyActiveUsersSecond, // 日活跃用户第二高
      dailyActiveUsersThird, // 日活跃用户第三高
    };
  }),
});
