// 用户活跃度分类常量定义

export interface ActivityLevel {
  name: string;
  emoji: string;
  minRequests: number;
  maxRequests?: number;
  color: string;
  textColor: string;
  description: string;
}

// 活跃度分类定义（按日均请求量）
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    name: "天选码农",
    emoji: "🔥",
    minRequests: 200,
    color: "#9333ea",
    textColor: "text-purple-600",
    description: "≥200次/天",
  },
  {
    name: "卷王是你",
    emoji: "👑",
    minRequests: 100,
    maxRequests: 199,
    color: "#dc2626",
    textColor: "text-red-600",
    description: "100-199次/天",
  },
  {
    name: "埋头苦干",
    emoji: "⚡",
    minRequests: 50,
    maxRequests: 99,
    color: "#ea580c",
    textColor: "text-orange-600",
    description: "50-99次/天",
  },
  {
    name: "摸鱼能手",
    emoji: "🧘",
    minRequests: 10,
    maxRequests: 49,
    color: "#10b981",
    textColor: "text-green-600",
    description: "10-49次/天",
  },
  {
    name: "躺平咸鱼",
    emoji: "👻",
    minRequests: 0,
    maxRequests: 9,
    color: "#f59e0b",
    textColor: "text-yellow-600",
    description: "<10次/天",
  },
];

// 根据日均请求量获取活跃度等级
export function getActivityLevelByAvgRequests(
  avgRequests: number,
): ActivityLevel {
  for (const level of ACTIVITY_LEVELS) {
    if (avgRequests >= level.minRequests) {
      if (!level.maxRequests || avgRequests <= level.maxRequests) {
        return level;
      }
      if (level.minRequests === 200) {
        // 天选码农没有上限
        return level;
      }
    }
  }
  // 默认返回最低等级
  return ACTIVITY_LEVELS[ACTIVITY_LEVELS.length - 1]!;
}

// 获取格式化的活跃度显示名称
export function getFormattedActivityName(level: ActivityLevel): string {
  return `${level.emoji} ${level.name}`;
}
