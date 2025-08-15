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
  ReferenceLine,
} from "recharts";
import { type HourlyData } from "@/server/api/routers/stats";

interface TooltipPayload {
  color: string;
  dataKey: string;
  value: number;
  payload: {
    今日当前: number;
    昨日当前: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface CumulativeChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function CumulativeChart({
  todayData,
  yesterdayData,
}: CumulativeChartProps) {
  // 获取当前时间
  const currentHour = new Date().getHours();

  // 计算累积数据
  let todayCumulative = 0;
  let yesterdayCumulative = 0;

  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const dataHour = new Date(today.hour).getHours();
    const hour = new Date(today.hour).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 累积计算
    todayCumulative += today.count;
    yesterdayCumulative += yesterday?.count ?? 0;

    const isFuture = dataHour > currentHour;

    return {
      hour,
      今日累积: todayCumulative,
      昨日累积: yesterdayCumulative,
      今日当前: today.count,
      昨日当前: yesterday?.count ?? 0,
      isFuture,
      hourIndex: dataHour,
    };
  });

  // 预测今日最终数据
  const currentData = chartData[currentHour];
  const yesterdayFinalTotal = chartData[chartData.length - 1]?.昨日累积 ?? 0;
  const todayCurrentTotal = currentData?.今日累积 ?? 0;

  // 基于当前进度预测今日最终结果
  const progressRatio = (currentHour + 1) / 24;
  const predictedTodayTotal = Math.round(todayCurrentTotal / progressRatio);

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
            <div className="mt-2 border-t border-slate-200 pt-2">
              <p className="text-sm text-slate-600">
                当前小时: 今日{data.今日当前} vs 昨日{data.昨日当前}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* 预测信息 - 移到上方 */}
      <div className="mb-4 grid grid-cols-3 gap-4 text-xs text-slate-600">
        <div className="text-center">
          <div className="font-medium text-slate-800">当前进度</div>
          <div>{(((currentHour + 1) / 24) * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-slate-800">预测今日总数</div>
          <div
            className={
              predictedTodayTotal > yesterdayFinalTotal
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {predictedTodayTotal.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-slate-800">vs昨日预测</div>
          <div
            className={
              predictedTodayTotal > yesterdayFinalTotal
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {predictedTodayTotal > yesterdayFinalTotal ? "+" : ""}
            {(
              ((predictedTodayTotal - yesterdayFinalTotal) /
                yesterdayFinalTotal) *
              100
            ).toFixed(1)}
            %
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient
              id="todayCumulativeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient
              id="yesterdayCumulativeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
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
            tickFormatter={(value: number) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* 当前时间线 */}
          <ReferenceLine
            x={chartData[currentHour]?.hour}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: "当前时间", position: "top" }}
          />

          {/* 昨日累积 */}
          <Area
            type="monotone"
            dataKey="昨日累积"
            stackId="1"
            stroke="#94a3b8"
            fill="url(#yesterdayCumulativeGradient)"
            strokeWidth={2}
          />

          {/* 今日累积 */}
          <Area
            type="monotone"
            dataKey="今日累积"
            stackId="2"
            stroke="#3b82f6"
            fill="url(#todayCumulativeGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
