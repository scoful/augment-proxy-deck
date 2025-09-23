import {
  ComposedChart,
  Bar,
  Line,
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

interface VehicleWaterfallChartProps {
  days: number;
  carType?: "all" | "social" | "black";
}

export default function VehicleWaterfallChart({
  days,
  carType = "all",
}: VehicleWaterfallChartProps) {
  // 获取车辆瀑布图数据
  const { data: waterfallData, isLoading } =
    api.history.getVehicleWaterfallTrends.useQuery({
      days,
      carType,
    });

  // 处理图表数据 - 分组堆叠柱状图格式
  const chartData =
    waterfallData?.map((trend) => ({
      date: trend.dataDate,
      // 正向变化组（增加车辆）
      newActive: trend.newActive,
      removedInactive: trend.removedInactive,
      // 负向变化组（减少车辆，使用负值显示）
      newlyInactive: -trend.newlyInactive,
      sameDayInactive: -trend.sameDayInactive,
      // 总量信息
      totalVehicles: trend.totalVehicles,
      previousTotal: trend.previousTotalVehicles,
      netChange: trend.totalVehicleChange,
      // 原始数据
      rawData: trend,
    })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      const raw = data.rawData;

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <p className="mb-2 font-medium text-slate-800">{`日期: ${label}`}</p>

          <div className="space-y-1 text-sm">
            <p className="text-slate-600">
              前日车辆: {formatNumber(data.previousTotal)}
            </p>

            <div className="mt-2 border-t border-slate-100 pt-2">
              <p className="text-green-600">
                ↗ 新增可用车辆: +{formatNumber(raw.newActive)}
              </p>
              <p className="text-blue-600">
                ↗ 移除不可用车辆: +{formatNumber(raw.removedInactive)}
              </p>
              <p className="text-red-600">
                ↘ 新增不可用车辆: -{formatNumber(raw.newlyInactive)}
              </p>
              <p className="text-gray-800">
                ↘ 当天新增当天不可用车辆: -{formatNumber(raw.sameDayInactive)}
              </p>
            </div>

            <div className="mt-2 border-t border-slate-100 pt-2">
              <p className="font-medium text-slate-800">
                当日车辆: {formatNumber(data.totalVehicles)}
              </p>
              <p className="text-sm font-medium text-purple-600">
                净变化: {data.netChange > 0 ? "+" : ""}
                {formatNumber(data.netChange)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 计算统计数据
  const stats =
    chartData.length > 0
      ? {
          totalNewActive: chartData.reduce(
            (sum, d) => sum + d.rawData.newActive,
            0,
          ),
          totalRemovedInactive: chartData.reduce(
            (sum, d) => sum + d.rawData.removedInactive,
            0,
          ),
          totalNewlyInactive: chartData.reduce(
            (sum, d) => sum + d.rawData.newlyInactive,
            0,
          ),
          totalSameDayInactive: chartData.reduce(
            (sum, d) => sum + d.rawData.sameDayInactive,
            0,
          ),
          avgDailyChange:
            chartData.reduce(
              (sum, d) => sum + d.rawData.totalVehicleChange,
              0,
            ) / chartData.length,
        }
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          车辆变化场景分析
        </h3>
        <p className="text-sm text-slate-600">
          分组展示车辆变化的4种场景
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>暂无数据</p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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

              {/* 零基准线 */}
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />

              {/* 正向变化组 - 堆叠在一起 */}
              <Bar
                dataKey="newActive"
                stackId="positive"
                fill="#10b981"
                fillOpacity={0.8}
                name="新增可用车辆"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="removedInactive"
                stackId="positive"
                fill="#3b82f6"
                fillOpacity={0.8}
                name="移除不可用车辆"
                radius={[2, 2, 0, 0]}
              />

              {/* 负向变化组 - 堆叠在一起，显示为负值 */}
              <Bar
                dataKey="newlyInactive"
                stackId="negative"
                fill="#ef4444"
                fillOpacity={0.8}
                name="新增不可用车辆"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="sameDayInactive"
                stackId="negative"
                fill="#374151"
                fillOpacity={0.8}
                name="当天新增当天不可用车辆"
                radius={[0, 0, 2, 2]}
              />

              {/* 净变化趋势线 */}
              <Line
                type="monotone"
                dataKey="netChange"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                name="净变化趋势"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {stats && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
            <div>
              <p className="text-slate-600">总新增可用</p>
              <p className="font-medium text-green-600">
                {formatNumber(stats.totalNewActive)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总移除不可用</p>
              <p className="font-medium text-blue-600">
                {formatNumber(stats.totalRemovedInactive)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总新增不可用</p>
              <p className="font-medium text-red-600">
                {formatNumber(stats.totalNewlyInactive)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总当天新增当天不可用</p>
              <p className="font-medium text-gray-700">
                {formatNumber(stats.totalSameDayInactive)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均日变化</p>
              <p
                className={`font-medium ${stats.avgDailyChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.avgDailyChange > 0 ? "+" : ""}
                {formatNumber(Math.round(stats.avgDailyChange))}
              </p>
            </div>
          </div>

          {/* 场景说明 */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="mb-2 text-sm font-medium text-slate-700">
              场景说明
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded bg-green-500"></div>
                <span>新增可用：今天新出现且可用的车辆</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded bg-blue-500"></div>
                <span>移除不可用：昨天不可用今天消失的车辆</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded bg-red-500"></div>
                <span>新增不可用：昨天可用今天不可用的车辆</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded bg-gray-600"></div>
                <span>当天新增当天不可用：今天新出现但不可用的车辆</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-3 flex-shrink-0 rounded bg-purple-500"></div>
                <span>净变化：车辆总数的日变化趋势</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
