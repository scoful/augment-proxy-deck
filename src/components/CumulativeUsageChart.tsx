import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";

interface CumulativeUsageChartProps {
  days: number;
}

export default function CumulativeUsageChart({
  days,
}: CumulativeUsageChartProps) {
  // 获取系统请求趋势数据
  const { data: systemTrends, isLoading } =
    api.history.getSystemRequestTrends.useQuery({
      days,
    });

  // 处理图表数据 - 计算累计用量和目标线
  const chartData = (() => {
    if (!systemTrends) return [];

    let cumulativeTotal = 0;
    const dataWithCumulative = systemTrends.map((trend) => {
      cumulativeTotal += trend.yesterdayTotal;
      return {
        date: trend.dataDate,
        cumulativeRequests: cumulativeTotal,
        dailyRequests: trend.yesterdayTotal,
      };
    });

    // 直接返回累计数据，目标线用ReferenceLine显示
    return dataWithCumulative;
  })();

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      const actualValue = data.cumulativeRequests;

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-green-600">
            累计用量: {formatNumber(actualValue)}
          </p>
          <p className="text-sm text-slate-600">
            当日新增: {formatNumber(data.dailyRequests)}
          </p>
        </div>
      );
    }
    return null;
  };

  // 计算统计数据
  const stats =
    chartData.length > 0
      ? {
          totalRequests:
            chartData[chartData.length - 1]?.cumulativeRequests || 0,
          averageDailyGrowth:
            chartData.length > 1
              ? Math.round(
                  chartData[chartData.length - 1]!.cumulativeRequests /
                    chartData.length,
                )
              : 0,
          latestDailyIncrease:
            chartData[chartData.length - 1]?.dailyRequests || 0,
        }
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">累计用量趋势</h3>
        <p className="text-sm text-slate-600">展示系统用量的累积增长趋势</p>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="cumulativeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                domain={[
                  0,
                  (dataMax: number) => dataMax * 1.1, // Y轴只基于实际数据，不受目标线影响
                ]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* 累计用量面积图 */}
              <Area
                type="monotone"
                dataKey="cumulativeRequests"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#cumulativeGradient)"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                name="累计用量"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {stats && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-slate-600">累计总量</p>
              <p className="font-medium text-green-600">
                {formatNumber(stats.totalRequests)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均日增长</p>
              <p className="font-medium text-slate-800">
                {formatNumber(stats.averageDailyGrowth)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最新日增量</p>
              <p className="font-medium text-slate-800">
                {formatNumber(stats.latestDailyIncrease)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
