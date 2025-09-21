import { useState } from "react";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import {
  TrophyIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface UserActivityRankingProps {
  limit?: number;
}

export default function UserActivityRanking({
  limit = 10,
}: UserActivityRankingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: rankings, isLoading } =
    api.history.getUserActivityRanking.useQuery({ limit });

  // 搜索特定用户排名
  const { data: userRank, isLoading: searchLoading, refetch: searchUser } =
    api.history.getUserRankPosition.useQuery(
      {
        userId: searchQuery.trim(),
        search: searchQuery.trim()
      },
      {
        enabled: false // 手动触发
      }
    );

  // 处理搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUser();
      setShowSearch(true);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800">
              用户活跃度排行榜
            </h3>
            <p className="text-sm text-slate-600">
              基于总请求量的用户活跃度排名（Top {limit}）
            </p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索用户ID或显示名称查看排名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searchLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? "搜索中..." : "查询排名"}
          </button>
          {showSearch && (
            <button
              onClick={clearSearch}
              className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果显示 */}
      {showSearch && userRank && (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(userRank.rank)}`}>
              {getRankIcon(userRank.rank)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">
                {userRank.displayName || userRank.userId}
              </h4>
              <p className="text-sm text-slate-600">
                排名: #{userRank.rank} / {userRank.totalUsers}
                <span className="ml-2 text-blue-600">
                  (超越了 {userRank.percentile}% 的用户)
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">总请求量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(userRank.totalRequests)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">活跃天数</p>
              <p className="font-medium text-slate-800">
                {userRank.activeDays} 天
              </p>
            </div>
            <div>
              <p className="text-slate-600">日均请求</p>
              <p className="font-medium text-slate-800">
                {formatNumber(userRank.avgDailyRequests)}
              </p>
            </div>
          </div>

          {/* 上下文排名 */}
          {(userRank.context.above.length > 0 || userRank.context.below.length > 0) && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-slate-500 mb-2">附近排名:</p>
              <div className="space-y-1 text-xs">
                {userRank.context.above.map((user, index) => (
                  <div key={user.userId} className="flex justify-between text-slate-600">
                    <span>#{userRank.rank - userRank.context.above.length + index} {user.displayName}</span>
                    <span>{formatNumber(user.totalRequests)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  <span>#{userRank.rank} {userRank.displayName} (当前)</span>
                  <span>{formatNumber(userRank.totalRequests)}</span>
                </div>
                {userRank.context.below.map((user, index) => (
                  <div key={user.userId} className="flex justify-between text-slate-600">
                    <span>#{userRank.rank + index + 1} {user.displayName}</span>
                    <span>{formatNumber(user.totalRequests)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 未找到搜索结果 */}
      {showSearch && !userRank && !searchLoading && (
        <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center">
          <p className="text-yellow-800">
            未找到用户 "{searchQuery}"，请检查用户ID或显示名称是否正确
          </p>
        </div>
      )}

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
