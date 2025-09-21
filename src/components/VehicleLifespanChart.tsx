import { api } from "@/utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

export default function VehicleLifespanChart() {
  const { data: lifespanData, isLoading } =
    api.history.getVehicleLifespanAnalysis.useQuery();

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`车辆: ${label}`}</p>
          <p className="text-sm text-blue-600">
            生命长度: {payload[0]?.value} 天
          </p>
          <p className="text-sm text-slate-600">
            类型:{" "}
            {data?.carType === "social"
              ? "社车"
              : data?.carType === "black"
                ? "黑车"
                : "未知"}
          </p>
          <p
            className={`text-sm ${data?.isCurrentlyActive ? "text-green-600" : "text-gray-500"}`}
          >
            状态: {data?.isCurrentlyActive ? "✅ 活跃" : "⚫ 失效"}
          </p>
          <p className="text-xs text-slate-500">
            {data?.firstSeen} ~ {data?.lastSeen}
          </p>
        </div>
      );
    }
    return null;
  };

  // 处理图表数据
  const chartData =
    lifespanData?.map((vehicle, index) => ({
      carId: vehicle.carId,
      lifespanDays: vehicle.lifespanDays,
      carType: vehicle.carType,
      firstSeen: vehicle.firstSeen,
      lastSeen: vehicle.lastSeen,
      isCurrentlyActive: vehicle.isCurrentlyActive,
      displayName: `${vehicle.carId.slice(-6)}`, // 只显示车辆ID的后6位
    })) || [];

  // 根据车辆类型和状态设置颜色（语义化配色）
  const getBarColor = (carType: string, isActive: boolean) => {
    if (!isActive) {
      return "#9ca3af"; // 失效车辆用淡灰色
    }

    switch (carType) {
      case "social":
        return "#10b981"; // 社车用绿色
      case "black":
        return "#1f2937"; // 黑车用黑色
      default:
        return "#fbbf24"; // 未知类型用黄色
    }
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
        <h3 className="text-lg font-semibold text-slate-800">
          车辆生命长度分析
        </h3>
        <p className="text-sm text-slate-600">
          显示每辆车从首次出现到最后活跃的生命周期长度，按新增时间排序
        </p>

        {/* 图例 */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span>社车</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: "#1f2937" }}
            ></div>
            <span>黑车</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: "#9ca3af" }}
            ></div>
            <span>失效车辆</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: "#fbbf24" }}
            ></div>
            <span>未知类型</span>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="displayName"
                tick={false}
                stroke="#64748b"
                height={20}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                label={{
                  value: "生命长度 (天)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="lifespanDays"
                name="生命长度 (天)"
                radius={[2, 2, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.carType, entry.isCurrentlyActive)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          {/* 核心指标卡片 */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">
                {chartData.length}
              </p>
              <p className="text-sm text-slate-600">总车辆数</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {chartData.filter((v) => v.isCurrentlyActive).length}
              </p>
              <p className="text-sm text-slate-600">活跃车辆</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">
                {chartData.filter((v) => !v.isCurrentlyActive).length}
              </p>
              <p className="text-sm text-slate-600">失效车辆</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  chartData.reduce((sum, v) => sum + v.lifespanDays, 0) /
                    chartData.length,
                )}
              </p>
              <p className="text-sm text-slate-600">平均寿命(天)</p>
            </div>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 车辆类型分布 */}
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 font-medium text-slate-700">车辆类型分布</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                    <span className="text-sm text-slate-600">社车</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {chartData.filter((v) => v.carType === "social").length} 辆
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: "#1f2937" }}
                    ></div>
                    <span className="text-sm text-slate-600">黑车</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {chartData.filter((v) => v.carType === "black").length} 辆
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: "#fbbf24" }}
                    ></div>
                    <span className="text-sm text-slate-600">未知</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {
                      chartData.filter(
                        (v) => v.carType !== "social" && v.carType !== "black",
                      ).length
                    }{" "}
                    辆
                  </span>
                </div>
              </div>
            </div>

            {/* 寿命统计 */}
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-3 font-medium text-slate-700">寿命统计</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">最长寿命</span>
                  <span className="font-medium text-green-600">
                    {Math.max(...chartData.map((v) => v.lifespanDays))} 天
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">最短寿命</span>
                  <span className="font-medium text-orange-600">
                    {Math.min(...chartData.map((v) => v.lifespanDays))} 天
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">存活率</span>
                  <span className="font-medium text-blue-600">
                    {(
                      (chartData.filter((v) => v.isCurrentlyActive).length /
                        chartData.length) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
