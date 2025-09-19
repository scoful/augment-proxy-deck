import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import {
  TrophyIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface DailyRequestRankingProps {
  limit?: number;
}

export default function DailyRequestRanking({
  limit = 10,
}: DailyRequestRankingProps) {
  const { data: rankings, isLoading } =
    api.history.getDailyRequestRanking.useQuery({ limit });

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
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
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded bg-slate-100"></div>
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
            单日请求量排行榜
          </h3>
          <p className="text-sm text-slate-600">
            历史上单日请求量最高的 {limit} 天记录
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((record) => (
            <div
              key={record.date}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm"
            >
              {/* 排名和日期 */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(record.rank)}`}
                >
                  {record.rank <= 3
                    ? getRankIcon(record.rank)
                    : `#${record.rank}`}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-800">
                      {record.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{formatNumber(record.totalUsers)} 活跃用户</span>
                  </div>
                </div>
              </div>

              {/* 请求量数据 */}
              <div className="text-right">
                <div className="text-xl font-bold text-slate-800">
                  {formatNumber(record.totalRequests)}
                </div>
                <div className="text-sm text-slate-600">
                  人均 {record.avgRequestsPerUser} 次
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {rankings && rankings.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-600">历史最高</p>
              <p className="font-bold text-yellow-600">
                {formatNumber(rankings[0]?.totalRequests || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均请求量</p>
              <p className="font-bold text-blue-600">
                {formatNumber(
                  Math.round(
                    rankings.reduce((sum, r) => sum + r.totalRequests, 0) /
                      rankings.length,
                  ),
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均用户数</p>
              <p className="font-bold text-green-600">
                {formatNumber(
                  Math.round(
                    rankings.reduce((sum, r) => sum + r.totalUsers, 0) /
                      rankings.length,
                  ),
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
