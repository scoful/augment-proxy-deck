"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface HourlyTrendChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function HourlyTrendChart({
  todayData,
  yesterdayData,
}: HourlyTrendChartProps) {
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

  // 分割数据为过去和未来
  const pastData = chartData.filter((d) => !d.isFuture);
  const futureData = chartData.filter((d) => d.isFuture);

  // 如果有未来数据，添加连接点
  const allData = chartData;

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={allData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
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

          {/* 今日请求 - 完整数据，动态样式 */}
          <Line
            type="monotone"
            dataKey="今日请求"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: any) => {
              const { payload } = props;
              const isFuture = payload?.isFuture;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isFuture ? 3 : 4}
                  fill="#3b82f6"
                  fillOpacity={isFuture ? 0.5 : 1}
                  strokeWidth={2}
                  stroke="#3b82f6"
                />
              );
            }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            strokeDasharray={(entry: any, index: number) => {
              const dataPoint = allData[index];
              return dataPoint?.isFuture ? "5 5" : "0";
            }}
            strokeOpacity={(entry: any, index: number) => {
              const dataPoint = allData[index];
              return dataPoint?.isFuture ? 0.5 : 1;
            }}
          />

          {/* 昨日请求 - 始终虚线 */}
          <Line
            type="monotone"
            dataKey="昨日请求"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#94a3b8", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#94a3b8", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
