/**
 * 自定义 Cloudflare Worker
 * 集成 OpenNext 生成的 fetch 处理器和自定义的 scheduled 处理器
 */

// @ts-ignore `.open-next/worker.js` 在构建时生成
import { default as handler } from "./.open-next/worker.js";
import {
  collectDailyStats,
  collectVehicleStatsDetail,
} from "./src/lib/data-collector";

// 导入类型定义
/// <reference path="./cloudflare-env.d.ts" />

// 重新声明全局类型以确保可用
declare global {
  interface ScheduledEvent {
    cron: string;
    scheduledTime: number;
  }

  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }

  interface ExportedHandler<Env = unknown> {
    fetch?: (
      request: Request,
      env: Env,
      ctx: ExecutionContext,
    ) => Response | Promise<Response>;
    scheduled?: (
      event: ScheduledEvent,
      env: Env,
      ctx: ExecutionContext,
    ) => void | Promise<void>;
  }
}

/**
 * 处理 Cron 触发器事件
 */
async function handleScheduled(
  event: ScheduledEvent,
  env: CloudflareEnv,
): Promise<void> {
  const cron = event.cron;
  console.log(`🕐 Cron triggered: ${cron}`);

  try {
    if (cron === "5 16 * * *") {
      // 每日16:05 UTC (UTC+8的00:05) - 执行所有数据采集
      console.log("🌅 执行每日数据采集任务 (UTC+8 00:05)...");
      const result = await collectDailyStats(env.DB);
      console.log("✅ 每日数据采集完成:", result);
    } else {
      console.warn(`⚠️ 未知的Cron调度: ${cron}`);
      const result = await collectDailyStats(env.DB);
      console.log("✅ 每日数据采集完成:", result);
    }
  } catch (error) {
    console.error(`❌ Cron任务执行失败 (${cron}):`, error);
    throw error;
  }
}

/**
 * 导出自定义 Worker 处理器
 */
export default {
  // 自定义 fetch 处理器，支持手动触发和正常请求
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // 手动触发端点
    if (url.pathname === "/api/manual-trigger" && request.method === "POST") {
      try {
        const body = (await request.json()) as { type: string };
        const triggerType = body.type;

        // 模拟 ScheduledEvent
        let mockEvent: ScheduledEvent;

        if (triggerType === "daily") {
          mockEvent = {
            cron: "5 16 * * *",
            scheduledTime: Date.now(),
          };
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid trigger type. Only 'daily' is supported.",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // 执行相同的处理逻辑
        console.log(`🔧 手动触发: ${triggerType} (${mockEvent.cron})`);
        const result = await handleScheduled(mockEvent, env);

        return new Response(
          JSON.stringify({
            success: true,
            result,
            triggerType,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      } catch (error) {
        console.error("❌ 手动触发失败:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // 正常的 OpenNext 处理
    return handler.fetch(request, env, ctx);
  },

  // 自定义 scheduled 处理器
  async scheduled(
    event: ScheduledEvent,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    // 使用 waitUntil 确保任务完成
    ctx.waitUntil(handleScheduled(event, env));
  },
} satisfies ExportedHandler<CloudflareEnv>;

// 如果应用使用 DO Queue 和 DO Tag Cache，需要重新导出
// 参见 https://opennext.js.org/cloudflare/caching
// 当前项目不使用 DO，所以注释掉这些导出
// @ts-ignore `.open-next/worker.js` 在构建时生成
// export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
