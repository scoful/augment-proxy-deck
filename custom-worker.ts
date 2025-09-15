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
    if (cron === "5 0 * * *") {
      // 每日00:05 - 执行日报数据采集
      console.log("🌅 执行每日数据采集任务...");
      const result = await collectDailyStats(env.DB);
      console.log("✅ 每日数据采集完成:", result);
    } else if (cron === "*/30 * * * *") {
      // 每30分钟 - 执行车辆明细数据采集
      console.log("🚗 执行车辆明细数据采集...");
      const result = await collectVehicleStatsDetail(env.DB);
      console.log("✅ 车辆明细数据采集完成:", result);
    } else {
      console.warn(`⚠️ 未知的Cron调度: ${cron}`);
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
  // 使用 OpenNext 生成的 fetch 处理器
  fetch: handler.fetch,

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
