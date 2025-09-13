/**
 * Cloudflare Worker Cron Handler
 * 处理定时任务触发器
 */

// Cloudflare Worker 类型定义
interface D1Database {
  prepare(query: string): any;
  exec(query: string): Promise<any>;
}

interface ScheduledEvent {
  type: "scheduled";
  cron: string;
  scheduledTime: number;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
import { collectDailyStats, collectVehicleStatsDetail } from "@/lib/data-collector";

export interface Env {
  DB: D1Database;
}

/**
 * 处理Cron触发器事件
 */
export async function handleCron(event: ScheduledEvent, env: Env): Promise<void> {
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
 * Worker主入口点
 */
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // 使用waitUntil确保任务完成
    ctx.waitUntil(handleCron(event, env));
  },
};
