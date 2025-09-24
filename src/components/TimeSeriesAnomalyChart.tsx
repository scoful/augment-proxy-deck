import {
  ScatterChart,
  Scatter,
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

interface TimeSeriesAnomalyChartProps {
  days: number;
}

export default function TimeSeriesAnomalyChart({
  days,
}: TimeSeriesAnomalyChartProps) {
  // 获取时间序列异常数据
  const { data: anomalyData, isLoading } =
    api.history.getTimeSeriesAnomalies.useQuery({
      days,
    });

  // 处理图表数据
  const chartData =
    anomalyData?.anomalies.map((anomaly) => ({
      x: new Date(anomaly.date).getTime(), // 转换为时间戳用于X轴
      y: anomaly.anomalyScore,
      date: anomaly.date,
      userId: anomaly.userId,
      displayName: anomaly.displayName,
      baseline: anomaly.baseline,
      current: anomaly.current,
      changeRate: anomaly.changeRate,
      zScore: anomaly.zScore,
      // 点的大小基于基线值（基线越小点越大，突出低基数用户）
      size: Math.max(50, 200 - anomaly.baseline * 2),
      // 颜色基于异常强度
      color:
        anomaly.anomalyScore > 4
          ? "#ef4444"
          : anomaly.anomalyScore > 3
            ? "#f59e0b"
            : "#10b981",
    })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <p className="font-medium text-slate-800">{data.displayName}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p>日期: {data.date}</p>
            <p>异常强度: {data.zScore}</p>
            <p>基线: {formatNumber(data.baseline)}</p>
            <p>当前: {formatNumber(data.current)}</p>
            <p>变化率: +{data.changeRate}%</p>
            <p className="text-xs text-slate-500">
              {data.baseline < 20 ? "🔥 低基数爆发" : "📈 高基数异常"}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 格式化X轴日期
  const formatXAxisDate = (tickItem: number) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          时间序列异常监控
        </h3>
        <p className="text-sm text-slate-600">
          识别低基数用户的突发异常使用模式（21天数据，7天基线，Z-score检测）
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : !anomalyData || chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>暂无异常检测到</p>
            {anomalyData && (
              <p className="mt-2 text-xs">
                检测参数：基线窗口
                {anomalyData.statistics.detectionParams.windowSize}天，
                Z-score阈值
                {anomalyData.statistics.detectionParams.zScoreThreshold}，
                变化率阈值
                {anomalyData.statistics.detectionParams.changeRateThreshold}%，
                基线限制&lt;
                {anomalyData.statistics.detectionParams.baselineLimit}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatXAxisDate}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="异常强度(Z-score)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* 异常阈值线 */}
                <ReferenceLine
                  y={2.5}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "异常阈值(Z=2.5)", position: "top" }}
                />

                {/* 高强度异常阈值线 */}
                <ReferenceLine
                  y={4}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  label={{ value: "高强度异常(Z=4)", position: "top" }}
                />

                {/* 异常点散点图 */}
                <Scatter
                  name="异常事件"
                  data={chartData}
                  fill="#ef4444"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* 统计信息 */}
          {anomalyData && (
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {anomalyData.statistics.totalAnomalies}
                  </p>
                  <p className="text-slate-600">异常事件</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {anomalyData.statistics.uniqueUsers}
                  </p>
                  <p className="text-slate-600">异常用户</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {chartData.filter((d) => d.baseline < 20).length}
                  </p>
                  <p className="text-slate-600">低基数爆发</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      chartData.reduce((sum, d) => sum + d.changeRate, 0) /
                        chartData.length,
                    ) || 0}
                    %
                  </p>
                  <p className="text-slate-600">平均变化率</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
