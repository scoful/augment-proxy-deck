import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";

interface VehicleAvailabilityChartProps {
  days: number;
}

export default function VehicleAvailabilityChart({ days }: VehicleAvailabilityChartProps) {
  // 获取车辆存活率趋势数据
  const { data: vehicleTrends, isLoading } = api.history.getVehicleSurvivalTrends.useQuery({
    days,
  });

  // 处理图表数据
  const chartData = vehicleTrends?.map((trend) => ({
    date: trend.dataDate,
    activeCars: trend.activeCars,
    inactiveCars: trend.totalCars - trend.activeCars,
    totalCars: trend.totalCars,
    survivalRate: trend.survivalRate,
  })) || [];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-green-600">
            可用车辆: {formatNumber(data.activeCars)}
          </p>
          <p className="text-sm text-red-600">
            不可用车辆: {formatNumber(data.inactiveCars)}
          </p>
          <p className="text-sm text-slate-600">
            总车辆数: {formatNumber(data.totalCars)}
          </p>
          <p className="text-sm text-blue-600">
            存活率: {data.survivalRate.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">车辆可用性趋势</h3>
        <p className="text-sm text-slate-600">显示每日车辆可用与不可用数量变化</p>
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
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Area
                type="monotone"
                dataKey="activeCars"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="可用车辆"
              />
              <Area
                type="monotone"
                dataKey="inactiveCars"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="不可用车辆"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">最高存活率</p>
              <p className="font-medium text-green-600">
                {Math.max(...chartData.map(d => d.survivalRate)).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">最低存活率</p>
              <p className="font-medium text-red-600">
                {Math.min(...chartData.map(d => d.survivalRate)).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均存活率</p>
              <p className="font-medium text-slate-800">
                {(chartData.reduce((sum, d) => sum + d.survivalRate, 0) / chartData.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">平均车辆数</p>
              <p className="font-medium text-slate-800">
                {formatNumber(Math.round(chartData.reduce((sum, d) => sum + d.totalCars, 0) / chartData.length))}
              </p>
            </div>
          </div>

          {/* 趋势指示器 */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">存活率趋势:</span>
              {(() => {
                if (chartData.length < 2) return <span className="text-slate-500">数据不足</span>;
                
                const firstRate = chartData[chartData.length - 1]?.survivalRate || 0;
                const lastRate = chartData[0]?.survivalRate || 0;
                const trend = firstRate - lastRate;
                
                if (Math.abs(trend) < 0.1) {
                  return <span className="text-slate-500">稳定</span>;
                } else if (trend > 0) {
                  return <span className="text-green-600">↗ 上升 {trend.toFixed(1)}%</span>;
                } else {
                  return <span className="text-red-600">↘ 下降 {Math.abs(trend).toFixed(1)}%</span>;
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
