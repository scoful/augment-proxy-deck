import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import {
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

interface HistoricalRank1RankingProps {
  limit?: number;
}

export default function HistoricalRank1Ranking({
  limit = 20,
}: HistoricalRank1RankingProps) {
  const { data: rankings, isLoading } =
    api.history.getHistoricalRank1Users.useQuery({ limit });

  // 截断用户名显示
  const truncateDisplayName = (name: string, maxLength = 10) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  // 获取排名图标 - 统一使用#x格式
  const getRankIcon = (rank: number) => {
    return `#${rank}`;
  };

  // 获取排名样式 - 统一样式
  const getRankStyle = (rank: number) => {
    return "bg-slate-100 text-slate-700";
  };

  // 获取统治力等级
  const getDominanceLevel = (dominanceRate: number) => {
    if (dominanceRate >= 50)
      return { level: "绝对统治", color: "text-red-600", emoji: "👑" };
    if (dominanceRate >= 30)
      return { level: "强势统治", color: "text-orange-600", emoji: "🔥" };
    if (dominanceRate >= 20)
      return { level: "稳定统治", color: "text-yellow-600", emoji: "⭐" };
    if (dominanceRate >= 10)
      return { level: "偶尔统治", color: "text-green-600", emoji: "✨" };
    return { level: "偶然登顶", color: "text-blue-600", emoji: "💫" };
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
        <StarIcon className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            历史第一名排行榜
          </h3>
          <p className="text-sm text-slate-600">
            获得日排行第一名次数最多的用户（Top {limit}）
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {rankings.map((user) => {
            const dominanceLevel = getDominanceLevel(user.dominanceRate);
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
                    {getRankIcon(user.rank)}
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
                      <span className={`text-xs ${dominanceLevel.color}`}>
                        {dominanceLevel.emoji} {dominanceLevel.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <TrophyIcon className="h-4 w-4" />
                        <span>登顶 {user.rank1Count} 次</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>统治率 {user.dominanceRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 统计数据 */}
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">
                    {user.rank1Count}
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-500">
                    <div>平均 {formatNumber(user.avgRequestsWhenRank1)}</div>
                    <div>{user.firstRank1Date}</div>
                    <div>~</div>
                    <div>{user.lastRank1Date}</div>
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
              <p className="text-slate-600">最强统治者</p>
              <p className="font-bold text-yellow-600">
                {rankings[0]?.rank1Count || 0} 次
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均登顶次数</p>
              <p className="font-bold text-blue-600">
                {Math.round(
                  rankings.reduce((sum, u) => sum + u.rank1Count, 0) /
                    rankings.length,
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">强势统治者</p>
              <p className="font-bold text-green-600">
                {rankings.filter((u) => u.dominanceRate >= 30).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">总统计天数</p>
              <p className="font-bold text-purple-600">
                {rankings[0]?.totalDaysWithData || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
