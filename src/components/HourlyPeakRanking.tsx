import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import {
  ClockIcon,
  CalendarDaysIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface HourlyPeakRankingProps {
  limit?: number;
}

export default function HourlyPeakRanking({
  limit = 15,
}: HourlyPeakRankingProps) {
  const { data: rankings, isLoading } =
    api.history.getHourlyPeakRanking.useQuery({ limit });

  // 获取排名图标 - 统一使用#x格式
  const getRankIcon = (rank: number) => {
    return `#${rank}`;
  };

  // 获取排名样式 - 统一样式
  const getRankStyle = (rank: number) => {
    return "bg-slate-100 text-slate-700";
  };

  // 获取时间段描述
  const getTimeDescription = (hour: number) => {
    if (hour >= 6 && hour < 12)
      return { period: "上午", color: "text-green-600" };
    if (hour >= 12 && hour < 18)
      return { period: "下午", color: "text-blue-600" };
    if (hour >= 18 && hour < 24)
      return { period: "晚上", color: "text-purple-600" };
    return { period: "凌晨", color: "text-slate-600" };
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
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
        <BoltIcon className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            小时级峰值排行榜
          </h3>
          <p className="text-sm text-slate-600">
            历史上单小时请求量最高的 {limit} 个记录
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((record) => {
            const timeDesc = getTimeDescription(record.hour);
            return (
              <div
                key={`${record.date}-${record.hour}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm"
              >
                {/* 排名和时间信息 */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(record.rank)}`}
                  >
                    {getRankIcon(record.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
                      <span className="font-medium text-slate-800">
                        {record.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700">{record.timeLabel}</span>
                      <span className={`text-xs ${timeDesc.color}`}>
                        {timeDesc.period}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 请求量数据 */}
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">
                    {formatNumber(record.requestCount)}
                  </div>
                  <div className="text-sm text-slate-600">请求/小时</div>
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
              <p className="text-slate-600">历史最高</p>
              <p className="font-bold text-yellow-600">
                {formatNumber(rankings[0]?.requestCount || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">平均峰值</p>
              <p className="font-bold text-blue-600">
                {formatNumber(
                  Math.round(
                    rankings.reduce((sum, r) => sum + r.requestCount, 0) /
                      rankings.length,
                  ),
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">高峰时段</p>
              <p className="font-bold text-green-600">
                {(() => {
                  const hourCounts = rankings.reduce(
                    (acc, r) => {
                      const period = getTimeDescription(r.hour).period;
                      acc[period] = (acc[period] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  );
                  const maxPeriod = Object.entries(hourCounts).reduce((a, b) =>
                    (hourCounts[a[0]] || 0) > (hourCounts[b[0]] || 0) ? a : b,
                  );
                  return maxPeriod[0];
                })()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">超高峰次数</p>
              <p className="font-bold text-red-600">
                {
                  rankings.filter(
                    (r) =>
                      r.requestCount >= (rankings[0]?.requestCount || 0) * 0.8,
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
