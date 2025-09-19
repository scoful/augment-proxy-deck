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
      displayName: `${vehicle.carId.slice(-6)}`, // 只显示车辆ID的后6位
    })) || [];

  // 根据车辆类型设置颜色
  const getBarColor = (carType: string) => {
    switch (carType) {
      case "social":
        return "#3b82f6"; // 蓝色
      case "black":
        return "#8b5cf6"; // 紫色（更柔和）
      default:
        return "#64748b"; // 灰色
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
          显示每辆车从首次出现到最后活跃的生命周期长度
        </p>
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
                    fill={getBarColor(entry.carType)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* 基础统计 */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">基础统计</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-600">总车辆数</p>
                  <p className="font-medium text-slate-800">
                    {chartData.length} 辆
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">平均寿命</p>
                  <p className="font-medium text-slate-800">
                    {Math.round(
                      chartData.reduce((sum, v) => sum + v.lifespanDays, 0) /
                        chartData.length,
                    )}{" "}
                    天
                  </p>
                </div>
              </div>
            </div>

            {/* 寿命分布 */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">寿命分布</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-600">最长寿命</p>
                  <p className="font-medium text-green-600">
                    {Math.max(...chartData.map((v) => v.lifespanDays))} 天
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">最短寿命</p>
                  <p className="font-medium text-orange-600">
                    {Math.min(...chartData.map((v) => v.lifespanDays))} 天
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 车辆类型分布 */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600">社车数量</p>
                <p className="font-medium text-blue-600">
                  {chartData.filter((v) => v.carType === "social").length} 辆
                </p>
              </div>
              <div>
                <p className="text-slate-600">黑车数量</p>
                <p className="font-medium text-red-600">
                  {chartData.filter((v) => v.carType === "black").length} 辆
                </p>
              </div>
              <div>
                <p className="text-slate-600">未知类型</p>
                <p className="font-medium text-slate-600">
                  {chartData.filter((v) => v.carType === "unknown").length} 辆
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
