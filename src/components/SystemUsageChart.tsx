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

  // 处理图表数据 - 显示前日总请求量（实际完整数据）
  const chartData =
    systemTrends?.map((trend) => ({
      date: trend.dataDate,
      totalRequests: trend.yesterdayTotal,
    })) || [];

  // 自定义Tooltip - 简化显示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-blue-600">
            总请求量: {formatNumber(payload[0]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">系统总用量趋势</h3>
        <p className="text-sm text-slate-600">
          显示每日系统总请求量变化（数据截止昨天）
        </p>
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
              <Line
                type="monotone"
                dataKey="totalRequests"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                name="总请求量"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 - 简化显示 */}
      {chartData.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">最高日请求量</p>
              <p className="font-medium text-blue-600">
                {formatNumber(
                  Math.max(...chartData.map((d) => d.totalRequests)),
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最低日请求量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(
                  Math.min(...chartData.map((d) => d.totalRequests)),
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均日请求量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(
                  Math.round(
                    chartData.reduce((sum, d) => sum + d.totalRequests, 0) /
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
