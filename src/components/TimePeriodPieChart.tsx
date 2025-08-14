"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface TimePeriodPieChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function TimePeriodPieChart({
  todayData,
  yesterdayData,
}: TimePeriodPieChartProps) {
  // 定义时段分类函数
  const categorizeByCount = (count: number) => {
    if (count >= 200) return "高峰时段";
    if (count >= 50) return "中等时段";
    return "低谷时段";
  };

  // 分析今日数据
  const todayCategories = todayData.reduce(
    (acc, data) => {
      const category = categorizeByCount(data.count);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 分析昨日数据
  const yesterdayCategories = yesterdayData.reduce(
    (acc, data) => {
      const category = categorizeByCount(data.count);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 准备今日饼图数据
  const todayPieData = Object.entries(todayCategories).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / 24) * 100).toFixed(1),
  }));

  // 准备昨日饼图数据
  const yesterdayPieData = Object.entries(yesterdayCategories).map(
    ([name, value]) => ({
      name,
      value,
      percentage: ((value / 24) * 100).toFixed(1),
    }),
  );

  // 颜色配置
  const COLORS = {
    高峰时段: "#ef4444",
    中等时段: "#f59e0b",
    低谷时段: "#10b981",
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">小时数: {data.value}小时</p>
          <p className="text-sm text-slate-600">占比: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // 自定义标签
  const renderLabel = ({ name, percentage }: any) => {
    return `${name}: ${percentage}%`;
  };

  return (
    <div className="h-80 w-full">
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 今日时段分布 */}
        <div className="flex flex-col">
          <h4 className="mb-2 text-center text-sm font-medium text-slate-700">
            今日时段分布
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={todayPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {todayPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 昨日时段分布 */}
        <div className="flex flex-col">
          <h4 className="mb-2 text-center text-sm font-medium text-slate-700">
            昨日时段分布
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={yesterdayPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {yesterdayPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-4 flex justify-center gap-6">
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
