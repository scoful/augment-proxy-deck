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

  // 计算固定目标值（基于当前累计的合理增长目标）
  const targetValue = (() => {
    if (chartData.length === 0) return 10000; // 默认目标
    const currentTotal =
      chartData[chartData.length - 1]?.cumulativeRequests || 0;
    if (currentTotal === 0) return 10000; // 如果没有数据，默认1万

    // 设定目标为当前累计的0.5倍，向上取整到万位
    const targetMultiplier = 0.5;
    const rawTarget = currentTotal * targetMultiplier;

    // 向上取整到万位，最小目标1万
    const roundedTarget = Math.max(10000, Math.ceil(rawTarget / 10000) * 10000);
    return roundedTarget;
  })();

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      const actualValue = data.cumulativeRequests;
      const difference = actualValue - targetValue;

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-green-600">
            累计用量: {formatNumber(actualValue)}
          </p>
          <p className="text-sm text-orange-600">
            目标用量: {formatNumber(targetValue)}
          </p>
          <p
            className={`text-sm ${difference >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {difference >= 0 ? "已达成目标" : "距离目标"}:{" "}
            {formatNumber(Math.abs(difference))}
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
          targetRequests: targetValue,
          averageDailyGrowth:
            chartData.length > 1
              ? Math.round(
                  chartData[chartData.length - 1]!.cumulativeRequests /
                    chartData.length,
                )
              : 0,
          latestDailyIncrease:
            chartData[chartData.length - 1]?.dailyRequests || 0,
          targetDifference:
            (chartData[chartData.length - 1]?.cumulativeRequests || 0) -
            targetValue,
        }
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">累计用量趋势</h3>
        <p className="text-sm text-slate-600">
          展示系统用量的累积增长趋势，一天比一天多
        </p>
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
                  (dataMax: number) => Math.max(dataMax, targetValue) * 1.1,
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

              {/* 水平目标线 */}
              <ReferenceLine
                y={targetValue}
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="8 4"
                label={`目标: ${formatNumber(targetValue)}`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {stats && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-slate-600">累计总量</p>
              <p className="font-medium text-green-600">
                {formatNumber(stats.totalRequests)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">目标完成度</p>
              <p
                className={`font-medium ${stats.targetDifference >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {((stats.totalRequests / stats.targetRequests) * 100).toFixed(
                  1,
                )}
                %
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

          {/* 目标线说明 */}
          <div className="mt-3 text-xs text-slate-500">
            <p>
              🎯 目标线设定为当前累计的0.5倍（向上取整到万位），用于参考对比
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
