import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import {
  TrophyIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface UserActivityRankingProps {
  limit?: number;
}

export default function UserActivityRanking({
  limit = 10,
}: UserActivityRankingProps) {
  const { data: rankings, isLoading } =
    api.history.getUserActivityRanking.useQuery({ limit });

  // 截断用户名显示
  const truncateDisplayName = (name: string, maxLength = 8) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // 获取活跃度等级
  const getActivityLevel = (totalRequests: number) => {
    if (totalRequests >= 10000)
      return { level: "超级活跃", color: "text-red-600", emoji: "🔥" };
    if (totalRequests >= 5000)
      return { level: "非常活跃", color: "text-orange-600", emoji: "⚡" };
    if (totalRequests >= 2000)
      return { level: "很活跃", color: "text-yellow-600", emoji: "🌟" };
    if (totalRequests >= 1000)
      return { level: "活跃", color: "text-green-600", emoji: "✨" };
    return { level: "一般", color: "text-blue-600", emoji: "💫" };
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded bg-slate-100"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <TrophyIcon className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            用户活跃度排行榜
          </h3>
          <p className="text-sm text-slate-600">
            基于总请求量的用户活跃度排名（Top {limit}）
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((user) => {
            const activityLevel = getActivityLevel(user.totalRequests);
            return (
              <div
                key={user.userId}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm"
              >
                {/* 排名和用户信息 */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(user.rank)}`}
                  >
                    {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-500" />
                      <span
                        className="font-medium text-slate-800"
                        title={user.displayName}
                      >
                        {truncateDisplayName(user.displayName)}
                      </span>
                      <span className={`text-xs ${activityLevel.color}`}>
                        {activityLevel.emoji} {activityLevel.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{user.activeDays} 活跃天</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>日均 {user.avgDailyRequests}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 总请求量和日期 */}
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">
                    {formatNumber(user.totalRequests)}
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-500">
                    <div>{user.firstActiveDate}</div>
                    <div>~</div>
                    <div>{user.lastActiveDate}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 统计信息 */}
      {rankings && rankings.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-600">最活跃用户</p>
              <p className="font-bold text-yellow-600">
                {formatNumber(rankings[0]?.totalRequests || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均请求量</p>
              <p className="font-bold text-blue-600">
                {formatNumber(
                  Math.round(
                    rankings.reduce((sum, u) => sum + u.totalRequests, 0) /
                      rankings.length,
                  ),
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均活跃天数</p>
              <p className="font-bold text-green-600">
                {Math.round(
                  rankings.reduce((sum, u) => sum + u.activeDays, 0) /
                    rankings.length,
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">超级活跃用户</p>
              <p className="font-bold text-red-600">
                {rankings.filter((u) => u.totalRequests >= 10000).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
