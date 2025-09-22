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

interface VehicleChangeChartProps {
  days: number;
  carType?: "all" | "social" | "black";
}

export default function VehicleChangeChart({
  days,
  carType = "all",
}: VehicleChangeChartProps) {
  // 获取车辆变化动态数据
  const { data: changeData, isLoading } =
    api.history.getVehicleChangeTrends.useQuery({
      days,
      carType,
    });

  // 处理图表数据
  const chartData =
    changeData?.map((trend) => ({
      date: trend.dataDate,
      newVehicles: trend.newVehicles,
      inactiveVehicles: -trend.inactiveVehicles, // 负值显示
      netChange: trend.netChange,
      totalVehicles: trend.totalVehicles,
      activeVehicles: trend.activeVehicles,
    })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-green-600">
            新增车辆: {formatNumber(data.newVehicles)}
          </p>
          <p className="text-sm text-red-600">
            失效车辆: {formatNumber(Math.abs(data.inactiveVehicles))}
          </p>
          <p className="text-sm text-blue-600">
            净变化: {data.netChange > 0 ? "+" : ""}
            {formatNumber(data.netChange)}
          </p>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="text-xs text-slate-500">
              总车辆: {formatNumber(data.totalVehicles)} | 活跃:{" "}
              {formatNumber(data.activeVehicles)}
            </p>
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
          totalNewVehicles: chartData.reduce(
            (sum, d) => sum + d.newVehicles,
            0,
          ),
          totalInactiveVehicles: chartData.reduce(
            (sum, d) => sum + Math.abs(d.inactiveVehicles),
            0,
          ),
          avgNetChange:
            chartData.reduce((sum, d) => sum + d.netChange, 0) /
            chartData.length,
          maxNewVehicles: Math.max(...chartData.map((d) => d.newVehicles)),
          maxInactiveVehicles: Math.max(
            ...chartData.map((d) => Math.abs(d.inactiveVehicles)),
          ),
        }
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">车辆变化动态</h3>
        <p className="text-sm text-slate-600">
          显示每日新增、失效车辆数量及净变化趋势
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
            <ComposedChart
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
                tickFormatter={(value) => formatNumber(Math.abs(value))}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* 零基准线 */}
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />

              {/* 新增车辆柱状图 */}
              <Bar
                dataKey="newVehicles"
                fill="#10b981"
                fillOpacity={0.8}
                name="新增车辆"
                radius={[2, 2, 0, 0]}
              />

              {/* 失效车辆柱状图（负值） */}
              <Bar
                dataKey="inactiveVehicles"
                fill="#ef4444"
                fillOpacity={0.8}
                name="失效车辆"
                radius={[0, 0, 2, 2]}
              />

              {/* 净变化趋势线 */}
              <Line
                type="monotone"
                dataKey="netChange"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                name="净变化"
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
              <p className="text-slate-600">总新增</p>
              <p className="font-medium text-green-600">
                {formatNumber(stats.totalNewVehicles)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">总失效</p>
              <p className="font-medium text-red-600">
                {formatNumber(stats.totalInactiveVehicles)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均净变化</p>
              <p
                className={`font-medium ${stats.avgNetChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.avgNetChange > 0 ? "+" : ""}
                {formatNumber(Math.round(stats.avgNetChange))}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最大新增</p>
              <p className="font-medium text-blue-600">
                {formatNumber(stats.maxNewVehicles)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最大失效</p>
              <p className="font-medium text-orange-600">
                {formatNumber(stats.maxInactiveVehicles)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
