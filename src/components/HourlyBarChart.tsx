"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface TooltipPayload {
  color: string;
  dataKey: string;
  value: number;
  payload: {
    差值: number;
    增长率: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface HourlyBarChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function HourlyBarChart({
  todayData,
  yesterdayData,
}: HourlyBarChartProps) {
  // 合并今日和昨日数据，计算差值
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const hour = new Date(today.hour).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const todayCount = today.count;
    const yesterdayCount = yesterday?.count ?? 0;
    const difference = todayCount - yesterdayCount;

    return {
      hour,
      今日请求: todayCount,
      昨日请求: yesterdayCount,
      差值: difference,
      增长率:
        yesterdayCount > 0
          ? ((difference / yesterdayCount) * 100).toFixed(1)
          : "0",
    };
  });

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label ?? ""}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
          {data && (
            <>
              <p className="text-sm text-slate-600">
                差值: {(data.差值 ?? 0) > 0 ? "+" : ""}
                {(data.差值 ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">
                增长率: {data.增长率 ?? "0"}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            tickFormatter={(value: number) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="今日请求"
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
            name="今日请求"
          />
          <Bar
            dataKey="昨日请求"
            fill="#94a3b8"
            radius={[2, 2, 0, 0]}
            name="昨日请求"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
