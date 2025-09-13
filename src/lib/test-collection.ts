#!/usr/bin/env tsx
/**
 * 数据采集测试脚本
 * 用于手动测试数据采集功能
 */
import {
  collectDailyStats,
  collectVehicleStatsDetail,
  collectUserStats,
  collectVehicleStatsSummary,
  collectSystemStats,
} from "./data-collector";

async function main() {
  const command = process.argv[2];

  console.log("🧪 数据采集测试脚本");
  console.log("==================");

  try {
    switch (command) {
      case "daily":
        console.log("📅 测试每日数据采集...");
        const dailyResult = await collectDailyStats();
        console.log("结果:", dailyResult);
        break;

      case "vehicle":
        console.log("🚗 测试车辆明细数据采集...");
        const vehicleResult = await collectVehicleStatsDetail();
        console.log("结果:", vehicleResult);
        break;

      case "user":
        console.log("👥 测试用户数据采集...");
        const userResult = await collectUserStats();
        console.log("结果:", userResult);
        break;

      case "vehicle-summary":
        console.log("🚗 测试车辆汇总数据采集...");
        const vehicleSummaryResult = await collectVehicleStatsSummary();
        console.log("结果:", vehicleSummaryResult);
        break;

      case "system":
        console.log("⚙️ 测试系统数据采集...");
        const systemResult = await collectSystemStats();
        console.log("结果:", systemResult);
        break;

      default:
        console.log("❌ 无效的命令");
        console.log("可用命令:");
        console.log("  daily          - 测试每日数据采集");
        console.log("  vehicle        - 测试车辆明细数据采集");
        console.log("  user           - 测试用户数据采集");
        console.log("  vehicle-summary - 测试车辆汇总数据采集");
        console.log("  system         - 测试系统数据采集");
        console.log("");
        console.log("示例:");
        console.log("  pnpm collect:daily");
        console.log("  pnpm collect:vehicle");
        process.exit(1);
    }

    console.log("✅ 测试完成");
    process.exit(0);
  } catch (error) {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }
}

// 运行测试
void main();
