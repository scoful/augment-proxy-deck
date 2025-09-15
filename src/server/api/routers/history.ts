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
import { desc, eq, gte, and, like, or, count } from "drizzle-orm";
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
          .orderBy(desc(userStatsDetail.dataDate));
      } else {
        // 查询整体用户活跃度趋势
        return await ctx.db
          .select()
          .from(userStatsSummary)
          .where(gte(userStatsSummary.dataDate, startDate))
          .orderBy(desc(userStatsSummary.dataDate));
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
        .orderBy(desc(vehicleStatsSummary.dataDate));
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
        .orderBy(desc(vehicleStatsDetail.recordedAt));
    }),

  // 获取系统请求量趋势
  getSystemRequestTrends: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split("T")[0]!;

      return await ctx.db
        .select()
        .from(systemStatsSummary)
        .where(gte(systemStatsSummary.dataDate, startDate))
        .orderBy(desc(systemStatsSummary.dataDate));
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
        .orderBy(desc(systemStatsDetail.dataDate));
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
        type: z.enum([
          "daily",
          "vehicle_detail",
          "user",
          "vehicle_summary",
          "system",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 获取 D1 数据库实例 - 需要从 Cloudflare Workers 环境中获取
      let d1Database;
      try {
        // 在 Cloudflare Workers 环境中获取 D1 绑定
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        const cloudflareContext = getCloudflareContext();
        d1Database = cloudflareContext.env?.DB;
      } catch {
        // 在本地开发环境中，使用默认的本地数据库
        d1Database = undefined;
      }

      switch (input.type) {
        case "daily":
          return await collectDailyStats(d1Database);
        case "vehicle_detail":
          return await collectVehicleStatsDetail(d1Database);
        case "user":
          return await collectUserStats(d1Database);
        case "vehicle_summary":
          return await collectVehicleStatsSummary(d1Database);
        case "system":
          return await collectSystemStats(d1Database);
        default:
          throw new Error("Invalid collection type");
      }
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

    // 获取数据量统计 - 使用 COUNT 查询优化性能
    const [userDetailCount] = await ctx.db
      .select({ count: count() })
      .from(userStatsDetail);

    const [vehicleDetailCount] = await ctx.db
      .select({ count: count() })
      .from(vehicleStatsDetail);

    const [systemDetailCount] = await ctx.db
      .select({ count: count() })
      .from(systemStatsDetail);

    return {
      latestDates: {
        user: latestUserData[0]?.dataDate || null,
        vehicle: latestVehicleData[0]?.dataDate || null,
        system: latestSystemData[0]?.dataDate || null,
      },
      recordCounts: {
        userDetail: userDetailCount?.count || 0,
        vehicleDetail: vehicleDetailCount?.count || 0,
        systemDetail: systemDetailCount?.count || 0,
      },
    };
  }),
});
