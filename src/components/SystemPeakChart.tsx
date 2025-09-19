import { api } from "@/utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SystemPeakChartProps {
  days: number;
}

export default function SystemPeakChart({ days }: SystemPeakChartProps) {
  const { data: systemTrends, isLoading } = api.history.getSystemRequestTrends.useQuery({
    days,
  });

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // 处理图表数据 - 显示每日小时峰值
  const chartData =
    systemTrends?.map((trend) => ({
      date: trend.dataDate,
      dailyPeak: trend.dailyPeak || 0,
    })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-red-600">
            小时峰值: {formatNumber(payload[0]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-slate-200"></div>
          <div className="h-64 rounded bg-slate-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">系统峰值趋势</h3>
        <p className="text-sm text-slate-600">
          显示每日小时级请求峰值变化（瞬时最高负载）
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="dailyPeak"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                name="小时峰值"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 峰值统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">最高峰值</p>
              <p className="font-medium text-red-600">
                {formatNumber(Math.max(...chartData.map((d) => d.dailyPeak)))}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最低峰值</p>
              <p className="font-medium text-orange-600">
                {formatNumber(Math.min(...chartData.map((d) => d.dailyPeak)))}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均峰值</p>
              <p className="font-medium text-slate-800">
                {formatNumber(
                  Math.round(
                    chartData.reduce((sum, d) => sum + d.dailyPeak, 0) /
                      chartData.length,
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
