"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface GrowthRadarChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function GrowthRadarChart({
  todayData,
  yesterdayData,
}: GrowthRadarChartProps) {
  // 计算增长率数据，按时段分组
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const hour = new Date(today.hour).getHours();

    const todayCount = today.count;
    const yesterdayCount = yesterday?.count || 0;
    const difference = todayCount - yesterdayCount;
    const growthRate =
      yesterdayCount > 0 ? (difference / yesterdayCount) * 100 : 0;

    // 格式化时间显示
    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;

    return {
      time: timeLabel,
      增长率: parseFloat(growthRate.toFixed(1)),
      今日请求: todayCount,
      昨日请求: yesterdayCount,
      绝对增长率: Math.abs(parseFloat(growthRate.toFixed(1))), // 用于雷达图显示
    };
  });

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label}`}</p>
          <p className="text-sm text-slate-600">增长率: {data.增长率}%</p>
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="text-sm text-slate-600">
              今日请求: {data.今日请求.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">
              昨日请求: {data.昨日请求.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 计算统计信息
  const stats = {
    maxGrowth: Math.max(...chartData.map((d) => d.增长率)),
    minGrowth: Math.min(...chartData.map((d) => d.增长率)),
    avgGrowth: (
      chartData.reduce((sum, d) => sum + d.增长率, 0) / chartData.length
    ).toFixed(1),
    positiveHours: chartData.filter((d) => d.增长率 > 0).length,
    negativeHours: chartData.filter((d) => d.增长率 < 0).length,
  };

  return (
    <div className="h-80 w-full">
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 雷达图 */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[-100, 100]}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Radar
                name="增长率"
                dataKey="增长率"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 统计信息 */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-slate-700">
              增长率统计
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">最高增长:</span>
                <span className="text-xs font-medium text-green-600">
                  {stats.maxGrowth.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-slate-600">最低增长:</span>
                <span className="text-xs font-medium text-red-600">
                  {stats.minGrowth.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-slate-600">平均增长:</span>
                <span className="text-xs font-medium text-slate-800">
                  {stats.avgGrowth}%
                </span>
              </div>

              <div className="mt-2 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">正增长时段:</span>
                  <span className="text-xs font-medium text-green-600">
                    {stats.positiveHours}小时
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">负增长时段:</span>
                  <span className="text-xs font-medium text-red-600">
                    {stats.negativeHours}小时
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
