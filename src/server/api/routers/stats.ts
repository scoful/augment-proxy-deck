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

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserStatsSummary = z.infer<typeof UserStatsSummarySchema>;
export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;

export const statsRouter = createTRPCRouter({
  // 获取用户统计数据
  getUserStats: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://proxy.poolhub.me/api/stats?limit=${input.limit}`
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
  getUserStatsSummary: publicProcedure
    .query(async () => {
      try {
        const response = await fetch(
          "https://proxy.poolhub.me/api/stats?limit=1"
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
});
