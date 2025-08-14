"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface HourlyAreaChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function HourlyAreaChart({
  todayData,
  yesterdayData,
}: HourlyAreaChartProps) {
  // 获取当前时间
  const currentHour = new Date().getHours();

  // 合并今日和昨日数据
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const dataHour = new Date(today.hour).getHours();
    const hour = new Date(today.hour).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 判断是否为未来时间
    const isFuture = dataHour > currentHour;

    return {
      hour,
      今日请求: today.count,
      昨日请求: yesterday?.count || 0,
      isFuture,
    };
  });

  // 分割数据：已发生的数据和未来数据
  const pastData = chartData.filter((d) => !d.isFuture);
  const futureData = chartData.filter((d) => d.isFuture);

  // 如果有未来数据，需要在过去数据的最后一个点和未来数据的第一个点之间建立连接
  const allData = chartData;

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const todayValue =
        payload.find((p: any) => p.dataKey === "今日请求")?.value || 0;
      const yesterdayValue =
        payload.find((p: any) => p.dataKey === "昨日请求")?.value || 0;
      const difference = todayValue - yesterdayValue;
      const percentage =
        yesterdayValue > 0
          ? ((difference / yesterdayValue) * 100).toFixed(1)
          : "0";

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="text-sm text-slate-600">
              差值: {difference > 0 ? "+" : ""}
              {difference.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">增长率: {percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={allData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient
              id="todayFutureGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="yesterdayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="hour"
            stroke="#64748b"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* 昨日数据 - 始终实线 */}
          <Area
            type="monotone"
            dataKey="昨日请求"
            stackId="1"
            stroke="#94a3b8"
            fill="url(#yesterdayGradient)"
            strokeWidth={2}
          />

          {/* 今日数据 - 根据时间动态样式 */}
          <Area
            type="monotone"
            dataKey="今日请求"
            stackId="2"
            stroke="#3b82f6"
            fill="url(#todayGradient)"
            strokeWidth={2}
            strokeDasharray={(entry: any, index: number) => {
              const dataPoint = allData[index];
              return dataPoint?.isFuture ? "5 5" : "0";
            }}
            fillOpacity={(entry: any, index: number) => {
              const dataPoint = allData[index];
              return dataPoint?.isFuture ? 0.3 : 1;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
