/**
 * Drizzle数据库Schema定义
 * 支持本地SQLite和Cloudflare D1
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 用户统计明细表 - 每日00:05采集allUsers字段
export const userStatsDetail = sqliteTable(
  "user_stats_detail",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    displayName: text("display_name"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    count1Hour: integer("count_1hour").notNull(),
    count24Hour: integer("count_24hour").notNull(),
    rank1Hour: integer("rank_1hour").notNull(),
    rank24Hour: integer("rank_24hour").notNull(),
    dataDate: text("data_date").notNull(), // 数据归属日期 YYYY-MM-DD
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_user_date").on(table.userId, table.dataDate),
    dataDateIdx: index("idx_data_date").on(table.dataDate),
  }),
);

// 用户统计汇总表 - 每日00:05采集summary字段
export const userStatsSummary = sqliteTable(
  "user_stats_summary",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    totalUsers1Hour: integer("total_users_1hour").notNull(),
    totalUsers24Hour: integer("total_users_24hour").notNull(),
    totalCount1Hour: integer("total_count_1hour").notNull(),
    totalCount24Hour: integer("total_count_24hour").notNull(),
    dataDate: text("data_date").notNull(), // 数据归属日期 YYYY-MM-DD
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    dataDateIdx: index("idx_user_summary_date").on(table.dataDate),
  }),
);

// 车辆统计明细表 - 每30分钟采集cars字段
export const vehicleStatsDetail = sqliteTable(
  "vehicle_stats_detail",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    carId: text("car_id").notNull(),
    userEmail: text("user_email"),
    targetUrl: text("target_url"),
    currentUsers: integer("current_users").notNull(),
    maxUsers: integer("max_users").notNull(),
    count1Hour: integer("count_1hour").notNull(),
    count24Hour: integer("count_24hour").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
    carType: text("car_type").notNull(), // 'social', 'black', 'unknown'
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    carRecordedIdx: index("idx_vehicle_detail_recorded").on(
      table.carId,
      table.recordedAt,
    ),
    carTypeIdx: index("idx_vehicle_detail_type").on(
      table.carType,
      table.recordedAt,
    ),
  }),
);

// 车辆统计汇总表 - 每日00:05采集summary字段
export const vehicleStatsSummary = sqliteTable(
  "vehicle_stats_summary",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    totalCars: integer("total_cars").notNull(),
    activeCars: integer("active_cars").notNull(),
    totalUsers: integer("total_users").notNull(),
    totalCount1Hour: integer("total_count_1hour").notNull(),
    totalCount24Hour: integer("total_count_24hour").notNull(),
    dataDate: text("data_date").notNull(), // 数据归属日期 YYYY-MM-DD
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    dataDateIdx: index("idx_vehicle_summary_date").on(table.dataDate),
  }),
);

// 系统统计明细表 - 每日00:05采集yesterday字段
export const systemStatsDetail = sqliteTable(
  "system_stats_detail",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hourTimestamp: text("hour_timestamp").notNull(),
    requestCount: integer("request_count").notNull(),
    uniqueUsers: integer("unique_users").notNull(),
    dataDate: text("data_date").notNull(), // 数据归属日期 YYYY-MM-DD
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    hourDateIdx: index("idx_system_detail_hour_date").on(
      table.hourTimestamp,
      table.dataDate,
    ),
    dataDateIdx: index("idx_system_detail_date").on(table.dataDate),
  }),
);

// 系统统计汇总表 - 每日00:05采集summary字段
export const systemStatsSummary = sqliteTable(
  "system_stats_summary",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    todayTotal: integer("today_total").notNull(),
    yesterdayTotal: integer("yesterday_total").notNull(),
    todayUsers: integer("today_users").notNull(),
    yesterdayUsers: integer("yesterday_users").notNull(),
    dataDate: text("data_date").notNull(), // 数据归属日期 YYYY-MM-DD
    recordedAt: text("recorded_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    dataDateIdx: index("idx_system_summary_date").on(table.dataDate),
  }),
);

// 数据采集日志表（用于监控和调试）
export const collectionLogs = sqliteTable("collection_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskType: text("task_type").notNull(), // 'user', 'vehicle', 'hourly'
  status: text("status").notNull(), // 'success', 'error'
  recordsCount: integer("records_count"),
  errorMessage: text("error_message"),
  executionTime: integer("execution_time"), // 毫秒
  recordedAt: text("recorded_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 导出类型
export type UserStatsDetail = typeof userStatsDetail.$inferSelect;
export type UserStatsSummary = typeof userStatsSummary.$inferSelect;
export type VehicleStatsDetail = typeof vehicleStatsDetail.$inferSelect;
export type VehicleStatsSummary = typeof vehicleStatsSummary.$inferSelect;
export type SystemStatsDetail = typeof systemStatsDetail.$inferSelect;
export type SystemStatsSummary = typeof systemStatsSummary.$inferSelect;
export type CollectionLog = typeof collectionLogs.$inferSelect;
