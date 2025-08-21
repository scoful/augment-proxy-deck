/**
 * 应用配置常量
 */

// API 轮询间隔配置（毫秒）
export const POLLING_INTERVALS = {
  // 设备统计页面 - 60秒更新一次
  USER_STATS: 60 * 1000,

  // 首页摘要 - 60秒更新一次
  HOME_SUMMARY: 60 * 1000,

  // 黑车统计页面 - 60秒更新一次
  VEHICLE_STATS: 60 * 1000,

  // 按小时统计页面 - 60秒更新一次（数据变化较慢）
  HOURLY_STATS: 60 * 1000,
} as const;

// React Query 默认配置
export const QUERY_CONFIG = {
  // 窗口重新获得焦点时重新获取数据
  refetchOnWindowFocus: true,

  // 保持之前的数据，避免闪烁
  keepPreviousData: true,

  // 错误重试次数
  retry: 3,

  // 重试延迟（毫秒）
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// 显示配置
export const DISPLAY_CONFIG = {
  // 设备名显示最大星号数
  MAX_ASTERISK_COUNT: 6,

  // 设备名最大显示长度
  MAX_DISPLAY_NAME_LENGTH: 20,

  // 截断后保留长度
  TRUNCATED_LENGTH: 15,

  // 默认分页大小选项
  PAGE_SIZE_OPTIONS: [50, 100, 200, 500],
} as const;

// API 端点配置
export const API_ENDPOINTS = {
  USER_STATS: "https://proxy.poolhub.me/api/stats",
} as const;
