/**
 * 历史数据查询API路由
 * 提供各种历史数据分析和趋势查询
 */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { 
  userStatsDetail, 
  userStatsSummary, 
  vehicleStatsDetail, 
  vehicleStatsSummary,
  systemStatsDetail,
  systemStatsSummary,
  collectionLogs 
} from '@/db/schema';
import { desc, eq, gte, and, sql, count, avg } from 'drizzle-orm';
import { 
  collectDailyStats, 
  collectVehicleStatsDetail,
  collectUserStats,
  collectVehicleStatsSummary,
  collectSystemStats
} from '@/lib/data-collector';

export const historyRouter = createTRPCRouter({
  // 获取用户活跃度趋势
  getUserActivityTrends: publicProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split('T')[0]!;

      if (input.userId) {
        // 查询特定用户的趋势
        return await ctx.db
          .select({
            dataDate: userStatsDetail.dataDate,
            count1Hour: userStatsDetail.count1Hour,
            count24Hour: userStatsDetail.count24Hour,
            rank1Hour: userStatsDetail.rank1Hour,
            rank24Hour: userStatsDetail.rank24Hour,
          })
          .from(userStatsDetail)
          .where(and(
            eq(userStatsDetail.userId, input.userId),
            gte(userStatsDetail.dataDate, startDate)
          ))
          .orderBy(desc(userStatsDetail.dataDate));
      } else {
        // 查询整体用户活跃度趋势
        return await ctx.db
          .select({
            dataDate: userStatsSummary.dataDate,
            totalUsers1Hour: userStatsSummary.totalUsers1Hour,
            totalUsers24Hour: userStatsSummary.totalUsers24Hour,
            totalCount1Hour: userStatsSummary.totalCount1Hour,
            totalCount24Hour: userStatsSummary.totalCount24Hour,
          })
          .from(userStatsSummary)
          .where(gte(userStatsSummary.dataDate, startDate))
          .orderBy(desc(userStatsSummary.dataDate));
      }
    }),

  // 获取车辆存活率趋势
  getVehicleSurvivalTrends: publicProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
      carType: z.enum(['all', 'social', 'black']).default('all'),
    }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split('T')[0]!;

      let query = ctx.db
        .select({
          dataDate: vehicleStatsSummary.dataDate,
          totalCars: vehicleStatsSummary.totalCars,
          activeCars: vehicleStatsSummary.activeCars,
          survivalRate: sql<number>`round(${vehicleStatsSummary.activeCars} * 100.0 / ${vehicleStatsSummary.totalCars}, 2)`.as('survivalRate'),
        })
        .from(vehicleStatsSummary)
        .where(gte(vehicleStatsSummary.dataDate, startDate))
        .orderBy(desc(vehicleStatsSummary.dataDate));

      return await query;
    }),

  // 获取社车vs黑车对比数据
  getSocialVsBlackComparison: publicProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split('T')[0]!;

      // 从明细数据中按日期和车型聚合
      return await ctx.db
        .select({
          dataDate: sql<string>`date(${vehicleStatsDetail.recordedAt})`.as('dataDate'),
          carType: vehicleStatsDetail.carType,
          totalCars: count(vehicleStatsDetail.carId).as('totalCars'),
          activeCars: sql<number>`count(case when ${vehicleStatsDetail.isActive} then 1 end)`.as('activeCars'),
          survivalRate: sql<number>`round(count(case when ${vehicleStatsDetail.isActive} then 1 end) * 100.0 / count(*), 2)`.as('survivalRate'),
          avgUtilization: sql<number>`round(avg(${vehicleStatsDetail.currentUsers} * 100.0 / ${vehicleStatsDetail.maxUsers}), 2)`.as('avgUtilization'),
        })
        .from(vehicleStatsDetail)
        .where(gte(sql`date(${vehicleStatsDetail.recordedAt})`, startDate))
        .groupBy(sql`date(${vehicleStatsDetail.recordedAt})`, vehicleStatsDetail.carType)
        .orderBy(desc(sql`date(${vehicleStatsDetail.recordedAt})`), vehicleStatsDetail.carType);
    }),

  // 获取系统请求量趋势
  getSystemRequestTrends: publicProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const startDate = daysAgo.toISOString().split('T')[0]!;

      return await ctx.db
        .select({
          dataDate: systemStatsSummary.dataDate,
          todayTotal: systemStatsSummary.todayTotal,
          yesterdayTotal: systemStatsSummary.yesterdayTotal,
          todayUsers: systemStatsSummary.todayUsers,
          yesterdayUsers: systemStatsSummary.yesterdayUsers,
        })
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
      const startDate = daysAgo.toISOString().split('T')[0]!;

      return await ctx.db
        .select({
          hour: sql<number>`cast(strftime('%H', ${systemStatsDetail.hourTimestamp}) as integer)`.as('hour'),
          dataDate: systemStatsDetail.dataDate,
          requestCount: systemStatsDetail.requestCount,
          uniqueUsers: systemStatsDetail.uniqueUsers,
        })
        .from(systemStatsDetail)
        .where(gte(systemStatsDetail.dataDate, startDate))
        .orderBy(systemStatsDetail.dataDate, sql`cast(strftime('%H', ${systemStatsDetail.hourTimestamp}) as integer)`);
    }),

  // 获取数据采集日志
  getCollectionLogs: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      taskType: z.enum(['user', 'vehicle_detail', 'vehicle_summary', 'system']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .select()
        .from(collectionLogs)
        .orderBy(desc(collectionLogs.recordedAt))
        .limit(input.limit);

      if (input.taskType) {
        query = query.where(eq(collectionLogs.taskType, input.taskType));
      }

      return await query;
    }),

  // 手动触发数据采集（开发和测试用）
  triggerDataCollection: publicProcedure
    .input(z.object({
      type: z.enum(['daily', 'vehicle_detail', 'user', 'vehicle_summary', 'system']),
    }))
    .mutation(async ({ input, ctx }) => {
      const d1Database = (ctx as any).d1Database; // 如果在Cloudflare环境

      switch (input.type) {
        case 'daily':
          return await collectDailyStats(d1Database);
        case 'vehicle_detail':
          return await collectVehicleStatsDetail(d1Database);
        case 'user':
          return await collectUserStats(d1Database);
        case 'vehicle_summary':
          return await collectVehicleStatsSummary(d1Database);
        case 'system':
          return await collectSystemStats(d1Database);
        default:
          throw new Error('Invalid collection type');
      }
    }),

  // 获取数据统计概览
  getDataOverview: publicProcedure
    .query(async ({ ctx }) => {
      // 获取最新的数据日期
      const latestUserData = await ctx.db
        .select({ dataDate: userStatsSummary.dataDate })
        .from(userStatsSummary)
        .orderBy(desc(userStatsSummary.dataDate))
        .limit(1);

      const latestVehicleData = await ctx.db
        .select({ dataDate: vehicleStatsSummary.dataDate })
        .from(vehicleStatsSummary)
        .orderBy(desc(vehicleStatsSummary.dataDate))
        .limit(1);

      const latestSystemData = await ctx.db
        .select({ dataDate: systemStatsSummary.dataDate })
        .from(systemStatsSummary)
        .orderBy(desc(systemStatsSummary.dataDate))
        .limit(1);

      // 获取数据量统计
      const userDetailCount = await ctx.db
        .select({ count: count() })
        .from(userStatsDetail);

      const vehicleDetailCount = await ctx.db
        .select({ count: count() })
        .from(vehicleStatsDetail);

      const systemDetailCount = await ctx.db
        .select({ count: count() })
        .from(systemStatsDetail);

      return {
        latestDates: {
          user: latestUserData[0]?.dataDate || null,
          vehicle: latestVehicleData[0]?.dataDate || null,
          system: latestSystemData[0]?.dataDate || null,
        },
        recordCounts: {
          userDetail: userDetailCount[0]?.count || 0,
          vehicleDetail: vehicleDetailCount[0]?.count || 0,
          systemDetail: systemDetailCount[0]?.count || 0,
        },
      };
    }),
});
