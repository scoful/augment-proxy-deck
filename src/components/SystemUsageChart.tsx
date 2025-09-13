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

interface SystemUsageChartProps {
  days: number;
}

export default function SystemUsageChart({ days }: SystemUsageChartProps) {
  // 获取系统请求趋势数据
  const { data: systemTrends, isLoading } =
    api.history.getSystemRequestTrends.useQuery({
      days,
    });

  // 处理图表数据
  const chartData =
    systemTrends?.map((trend) => ({
      date: trend.dataDate,
      todayTotal: trend.todayTotal,
      yesterdayTotal: trend.yesterdayTotal,
      growth: trend.todayTotal - trend.yesterdayTotal,
      growthRate:
        trend.yesterdayTotal > 0
          ? ((trend.todayTotal - trend.yesterdayTotal) / trend.yesterdayTotal) *
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
                增长量: {data.growth >= 0 ? "+" : ""}
                {formatNumber(data.growth)}
              </p>
              <p className="text-sm text-slate-600">
                增长率: {data.growthRate >= 0 ? "+" : ""}
                {data.growthRate.toFixed(1)}%
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
        <h3 className="text-lg font-semibold text-slate-800">系统总用量趋势</h3>
        <p className="text-sm text-slate-600">显示每日系统总请求量变化</p>
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
                dataKey="todayTotal"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                name="当日总请求量"
              />
              <Line
                type="monotone"
                dataKey="yesterdayTotal"
                stroke="#6b7280"
                strokeWidth={2}
                dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
                name="前日总请求量"
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
              <p className="text-slate-600">最高日请求量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(Math.max(...chartData.map((d) => d.todayTotal)))}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均日请求量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(
                  Math.round(
                    chartData.reduce((sum, d) => sum + d.todayTotal, 0) /
                      chartData.length,
                  ),
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总增长量</p>
              <p className="font-medium text-slate-800">
                {(() => {
                  const totalGrowth = chartData.reduce(
                    (sum, d) => sum + d.growth,
                    0,
                  );
                  return `${totalGrowth >= 0 ? "+" : ""}${formatNumber(totalGrowth)}`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均增长率</p>
              <p className="font-medium text-slate-800">
                {(() => {
                  const avgGrowthRate =
                    chartData.reduce((sum, d) => sum + d.growthRate, 0) /
                    chartData.length;
                  return `${avgGrowthRate >= 0 ? "+" : ""}${avgGrowthRate.toFixed(1)}%`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
