import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// 定义用户数据类型
const UserStatsSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  count1Hour: z.number(),
  count24Hour: z.number(),
  rank1Hour: z.number(),
  rank24Hour: z.number(),
});

const UserStatsSummarySchema = z.object({
  totalUsers1Hour: z.number(),
  totalUsers24Hour: z.number(),
  totalCount1Hour: z.number(),
  totalCount24Hour: z.number(),
});

const UserStatsResponseSchema = z.object({
  summary: UserStatsSummarySchema,
  topUsers: z.array(UserStatsSchema),
  allUsers: z.array(UserStatsSchema),
  updatedAt: z.string(),
});

// 定义黑车数据类型
const CarStatsSchema = z.object({
  carId: z.string(),
  userEmail: z.string(),
  targetUrl: z.string(),
  currentUsers: z.number(),
  maxUsers: z.number(),
  count1Hour: z.number(),
  count24Hour: z.number(),
  isActive: z.boolean(),
});

const CarStatsSummarySchema = z.object({
  totalCars: z.number(),
  activeCars: z.number(),
  totalUsers: z.number(),
  totalCount1Hour: z.number(),
  totalCount24Hour: z.number(),
});

const CarStatsResponseSchema = z.object({
  summary: CarStatsSummarySchema,
  cars: z.array(CarStatsSchema),
  updatedAt: z.string(),
});

// 定义按小时统计数据类型
const HourlyDataSchema = z.object({
  hour: z.string(),
  count: z.number(),
  uniqueUsers: z.number(),
});

const HourlyStatsSummarySchema = z.object({
  todayTotal: z.number(),
  yesterdayTotal: z.number(),
  todayUsers: z.number(),
  yesterdayUsers: z.number(),
});

const HourlyStatsResponseSchema = z.object({
  today: z.array(HourlyDataSchema),
  yesterday: z.array(HourlyDataSchema),
  summary: HourlyStatsSummarySchema,
  updatedAt: z.string(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserStatsSummary = z.infer<typeof UserStatsSummarySchema>;
export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;
export type CarStats = z.infer<typeof CarStatsSchema>;
export type CarStatsSummary = z.infer<typeof CarStatsSummarySchema>;
export type CarStatsResponse = z.infer<typeof CarStatsResponseSchema>;
export type HourlyData = z.infer<typeof HourlyDataSchema>;
export type HourlyStatsSummary = z.infer<typeof HourlyStatsSummarySchema>;
export type HourlyStatsResponse = z.infer<typeof HourlyStatsResponseSchema>;

export const statsRouter = createTRPCRouter({
  // 获取用户统计数据
  getUserStats: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://proxy.poolhub.me/api/stats?limit=${input.limit}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 验证数据结构
        const validatedData = UserStatsResponseSchema.parse(data);

        return validatedData;
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
        throw new Error("Failed to fetch user statistics");
      }
    }),

  // 获取用户统计摘要（仅摘要信息）
  getUserStatsSummary: publicProcedure.query(async () => {
    try {
      const response = await fetch(
        "https://proxy.poolhub.me/api/stats?limit=1",
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedData = UserStatsResponseSchema.parse(data);

      return {
        summary: validatedData.summary,
        updatedAt: validatedData.updatedAt,
      };
    } catch (error) {
      console.error("Failed to fetch user stats summary:", error);
      throw new Error("Failed to fetch user statistics summary");
    }
  }),

  // 获取黑车统计数据
  getCarStats: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://proxy.poolhub.me/api/car-stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 验证数据结构
      const validatedData = CarStatsResponseSchema.parse(data);

      return validatedData;
    } catch (error) {
      console.error("Failed to fetch car stats:", error);
      throw new Error("Failed to fetch car statistics");
    }
  }),

  // 获取黑车统计摘要（仅摘要信息）
  getCarStatsSummary: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://proxy.poolhub.me/api/car-stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedData = CarStatsResponseSchema.parse(data);

      return {
        summary: validatedData.summary,
        updatedAt: validatedData.updatedAt,
      };
    } catch (error) {
      console.error("Failed to fetch car stats summary:", error);
      throw new Error("Failed to fetch car statistics summary");
    }
  }),

  // 获取按小时统计数据
  getHourlyStats: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://proxy.poolhub.me/api/hourly-stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 验证数据结构
      const validatedData = HourlyStatsResponseSchema.parse(data);

      return validatedData;
    } catch (error) {
      console.error("Failed to fetch hourly stats:", error);
      throw new Error("Failed to fetch hourly statistics");
    }
  }),

  // 获取按小时统计摘要（仅摘要信息）
  getHourlyStatsSummary: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://proxy.poolhub.me/api/hourly-stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validatedData = HourlyStatsResponseSchema.parse(data);

      return {
        summary: validatedData.summary,
        updatedAt: validatedData.updatedAt,
      };
    } catch (error) {
      console.error("Failed to fetch hourly stats summary:", error);
      throw new Error("Failed to fetch hourly statistics summary");
    }
  }),
});
