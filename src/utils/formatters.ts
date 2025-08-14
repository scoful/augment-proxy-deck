import { DISPLAY_CONFIG } from "./config";

/**
 * 格式化显示名称，处理过多星号的情况
 * @param displayName 原始显示名称
 * @returns 格式化后的显示名称
 */
export function formatDisplayName(displayName: string): string {
  // 计算星号数量
  const asteriskCount = (displayName.match(/\*/g) || []).length;

  // 如果星号超过配置的最大数量，进行省略处理
  if (asteriskCount > DISPLAY_CONFIG.MAX_ASTERISK_COUNT) {
    // 保留开头和结尾的部分，中间用省略号代替
    const parts = displayName.split(" ");
    if (parts.length > 1) {
      // 如果有空格分隔，保留第一部分和最后的ID部分
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];

      // 如果第一部分星号太多，也要截断
      if (firstPart && firstPart.length > 10) {
        const truncatedFirst = firstPart.substring(0, 8) + "...";
        return `${truncatedFirst} ${lastPart}`;
      }

      return `${firstPart} ... ${lastPart}`;
    } else {
      // 没有空格的情况，直接截断
      if (displayName.length > DISPLAY_CONFIG.MAX_DISPLAY_NAME_LENGTH) {
        return (
          displayName.substring(0, DISPLAY_CONFIG.TRUNCATED_LENGTH) + "..."
        );
      }
    }
  }

  return displayName;
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("zh-CN");
}

/**
 * 格式化日期时间
 * @param dateString ISO日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 格式化相对时间
 * @param dateString ISO日期字符串
 * @returns 相对时间字符串 (如: "2分钟前")
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "刚刚";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatDateTime(dateString);
  }
}

/**
 * 格式化百分比
 * @param numerator 分子
 * @param denominator 分母
 * @param decimals 小数位数，默认1位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(
  numerator: number,
  denominator: number,
  decimals: number = 1,
): string {
  if (denominator === 0) return "0%";
  const percentage = (numerator / denominator) * 100;
  return `${percentage.toFixed(decimals)}%`;
}
