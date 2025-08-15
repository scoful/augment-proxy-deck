"use client";

import { type HourlyData } from "@/server/api/routers/stats";

interface DensityHeatmapProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function DensityHeatmap({
  todayData,
  yesterdayData,
}: DensityHeatmapProps) {
  // 获取当前时间
  const currentHour = new Date().getHours();

  // 计算最大值用于归一化
  const allValues = [
    ...todayData.map((d) => d.count),
    ...yesterdayData.map((d) => d.count),
  ];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues.filter((v) => v > 0));

  // 计算今日和昨日的峰值
  const todayPeakValue = Math.max(...todayData.map((d) => d.count));
  const yesterdayPeakValue = Math.max(...yesterdayData.map((d) => d.count));

  // 获取密度等级和颜色
  const getDensityLevel = (value: number) => {
    if (value === 0) return { level: 0, color: "#f8fafc", label: "无请求" };

    const ratio = (value - minValue) / (maxValue - minValue);

    if (ratio >= 0.8) return { level: 5, color: "#dc2626", label: "极高" };
    if (ratio >= 0.6) return { level: 4, color: "#ea580c", label: "高" };
    if (ratio >= 0.4) return { level: 3, color: "#f59e0b", label: "中高" };
    if (ratio >= 0.2) return { level: 2, color: "#eab308", label: "中" };
    return { level: 1, color: "#84cc16", label: "低" };
  };

  // 准备热力图数据
  const heatmapData = [
    {
      day: "今日",
      hours: todayData.map((data) => {
        const hour = new Date(data.hour).getHours();
        const isFuture = hour > currentHour;
        const density = getDensityLevel(data.count);
        const isPeak = data.count === todayPeakValue && data.count > 0;

        return {
          hour,
          value: data.count,
          density,
          isFuture,
          isPeak,
          hourLabel: hour.toString().padStart(2, "0") + ":00",
        };
      }),
    },
    {
      day: "昨日",
      hours: yesterdayData.map((data) => {
        const hour = new Date(data.hour).getHours();
        const density = getDensityLevel(data.count);
        const isPeak = data.count === yesterdayPeakValue && data.count > 0;

        return {
          hour,
          value: data.count,
          density,
          isFuture: false,
          isPeak,
          hourLabel: hour.toString().padStart(2, "0") + ":00",
        };
      }),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {/* 统计信息 - 移到上方 */}
        <div className="mb-4 grid grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="text-center">
            <div className="font-medium text-slate-800">今日峰值</div>
            <div>
              {Math.max(...todayData.map((d) => d.count)).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-slate-800">昨日峰值</div>
            <div>
              {Math.max(...yesterdayData.map((d) => d.count)).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-slate-800">当前时间</div>
            <div className="text-blue-600">
              {currentHour.toString().padStart(2, "0")}:00
            </div>
          </div>
        </div>

        {/* 热力图主体 */}
        <div className="flex flex-col gap-4 py-8">
          {heatmapData.map((dayData) => (
            <div key={dayData.day} className="flex items-center gap-2">
              {/* 日期标签 */}
              <div className="w-12 text-right text-sm font-medium text-slate-700">
                {dayData.day}
              </div>

              {/* 小时格子 */}
              <div className="grid flex-1 grid-cols-24 gap-0.5">
                {dayData.hours.map((hourData, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-sm border border-slate-200 transition-all duration-200 hover:z-10 hover:scale-110 ${hourData.isFuture ? "border-dashed opacity-50" : ""} `}
                    style={{
                      backgroundColor: hourData.density.color,
                      fontSize: "8px",
                    }}
                    title={`${dayData.day} ${hourData.hourLabel}: ${hourData.value.toLocaleString()}请求 (${hourData.density.label})${hourData.isPeak ? " 🏆 峰值" : ""}`}
                  >
                    {/* 峰值标识 */}
                    {hourData.isPeak && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl">
                        👑
                      </div>
                    )}
                    <span className="font-medium text-slate-700">
                      {hourData.hour}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 密度图例 */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="text-xs text-slate-600">请求密度:</span>
          <div className="flex items-center gap-1">
            {[
              { level: 0, color: "#f8fafc", label: "无" },
              { level: 1, color: "#84cc16", label: "低" },
              { level: 2, color: "#eab308", label: "中" },
              { level: 3, color: "#f59e0b", label: "中高" },
              { level: 4, color: "#ea580c", label: "高" },
              { level: 5, color: "#dc2626", label: "极高" },
            ].map((item, index) => (
              <div
                key={`density-${item.level}-${index}`}
                className="flex items-center gap-1"
              >
                <div
                  className="h-3 w-3 rounded-sm border border-slate-300"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
