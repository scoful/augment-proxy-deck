/**
 * Vercel Cron Job API Route
 * 每日08:40 UTC (UTC+8 16:40) 执行数据采集任务 - 临时测试时间
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { collectDailyStats } from "@/lib/data-collector";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // 只允许GET请求（Vercel cron jobs使用GET）
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  // 验证请求来源（Vercel cron jobs会发送Authorization header）
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("❌ Unauthorized cron request:", {
      authHeader: authHeader ? "***" : "missing",
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    });
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const startTime = Date.now();
  console.log("🕐 Vercel Cron triggered: 40 8 * * * (UTC+8 16:40) - 临时测试");

  try {
    // 执行每日数据采集任务
    console.log("🌅 执行每日数据采集任务...");
    const result = await collectDailyStats();

    const executionTime = Date.now() - startTime;
    console.log(`✅ 每日数据采集完成 (${executionTime}ms):`, result);

    return res.status(200).json({
      success: true,
      result,
      executionTime,
      timestamp: new Date().toISOString(),
      timezone: "UTC+8",
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Cron任务执行失败 (${executionTime}ms):`, error);

    return res.status(500).json({
      success: false,
      error: errorMessage,
      executionTime,
      timestamp: new Date().toISOString(),
    });
  }
}
