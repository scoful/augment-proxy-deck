/**
 * 定时任务管理器
 * 生产环境使用Cloudflare Cron Triggers
 * 本地开发通过API手动触发
 */
import { collectDailyStats, collectVehicleStatsDetail } from './data-collector';

// Cloudflare Cron配置（仅用于文档）
const CLOUDFLARE_CRON_SCHEDULES = {
  DAILY_STATS: '5 0 * * *',      // 每日00:05 - 日报数据采集
  VEHICLE_DETAIL: '*/30 * * * *', // 每30分钟 - 车辆明细数据采集
} as const;

/**
 * 获取Cron配置信息
 */
export function getCronSchedules() {
  return {
    schedules: CLOUDFLARE_CRON_SCHEDULES,
    note: 'These schedules are for Cloudflare Cron Triggers in production',
  };
}

/**
 * 手动触发每日数据采集（测试用）
 */
export async function triggerDailyCollection() {
  console.log('🔧 手动触发每日数据采集...');
  try {
    const result = await collectDailyStats();
    console.log('✅ 手动触发完成:', result);
    return result;
  } catch (error) {
    console.error('❌ 手动触发失败:', error);
    throw error;
  }
}

/**
 * 手动触发车辆明细数据采集（测试用）
 */
export async function triggerVehicleDetailCollection() {
  console.log('🔧 手动触发车辆明细数据采集...');
  try {
    const result = await collectVehicleStatsDetail();
    console.log('✅ 手动触发完成:', result);
    return result;
  } catch (error) {
    console.error('❌ 手动触发失败:', error);
    throw error;
  }
}

/**
 * 获取数据采集状态信息
 */
export function getCollectionStatus() {
  return {
    environment: 'local_development',
    triggerMethod: 'manual_api_calls',
    productionMethod: 'cloudflare_cron_triggers',
    availableTriggers: ['daily', 'vehicle_detail', 'user', 'vehicle_summary', 'system'],
  };
}
