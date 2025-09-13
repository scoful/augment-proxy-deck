import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";

interface SystemUsersChartProps {
  days: number;
}

export default function SystemUsersChart({ days }: SystemUsersChartProps) {
  // 获取系统请求趋势数据
  const { data: systemTrends, isLoading } =
    api.history.getSystemRequestTrends.useQuery({
      days,
    });

  // 处理图表数据
  const chartData =
    systemTrends?.map((trend) => ({
      date: trend.dataDate,
      todayUsers: trend.todayUsers,
      yesterdayUsers: trend.yesterdayUsers,
      userGrowth: trend.todayUsers - trend.yesterdayUsers,
      userGrowthRate:
        trend.yesterdayUsers > 0
          ? ((trend.todayUsers - trend.yesterdayUsers) / trend.yesterdayUsers) *
            100
          : 0,
    })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
          {data && (
            <>
              <p className="text-sm text-slate-600">
                用户增长: {data.userGrowth >= 0 ? "+" : ""}
                {formatNumber(data.userGrowth)}
              </p>
              <p className="text-sm text-slate-600">
                增长率: {data.userGrowthRate >= 0 ? "+" : ""}
                {data.userGrowthRate.toFixed(1)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          系统总用户数趋势
        </h3>
        <p className="text-sm text-slate-600">显示每日活跃用户数量变化</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>暂无数据</p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="todayUsers"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                name="当日活跃用户"
              />
              <Line
                type="monotone"
                dataKey="yesterdayUsers"
                stroke="#6b7280"
                strokeWidth={2}
                dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
                name="前日活跃用户"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">最高日活跃用户</p>
              <p className="font-medium text-slate-800">
                {formatNumber(Math.max(...chartData.map((d) => d.todayUsers)))}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均日活跃用户</p>
              <p className="font-medium text-slate-800">
                {formatNumber(
                  Math.round(
                    chartData.reduce((sum, d) => sum + d.todayUsers, 0) /
                      chartData.length,
                  ),
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总用户增长</p>
              <p className="font-medium text-slate-800">
                {(() => {
                  const totalUserGrowth = chartData.reduce(
                    (sum, d) => sum + d.userGrowth,
                    0,
                  );
                  return `${totalUserGrowth >= 0 ? "+" : ""}${formatNumber(totalUserGrowth)}`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均增长率</p>
              <p className="font-medium text-slate-800">
                {(() => {
                  const avgUserGrowthRate =
                    chartData.reduce((sum, d) => sum + d.userGrowthRate, 0) /
                    chartData.length;
                  return `${avgUserGrowthRate >= 0 ? "+" : ""}${avgUserGrowthRate.toFixed(1)}%`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
