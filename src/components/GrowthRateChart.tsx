"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type HourlyData } from '@/server/api/routers/stats';

interface GrowthRateChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function GrowthRateChart({ todayData, yesterdayData }: GrowthRateChartProps) {
  // 获取当前时间
  const currentHour = new Date().getHours();

  // 计算增长率数据
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const dataHour = new Date(today.hour).getHours();
    const hour = new Date(today.hour).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const todayCount = today.count;
    const yesterdayCount = yesterday?.count || 0;
    const difference = todayCount - yesterdayCount;
    const growthRate = yesterdayCount > 0 ? ((difference / yesterdayCount) * 100) : 0;

    // 判断是否为未来时间
    const isFuture = dataHour > currentHour;

    return {
      hour,
      增长率: parseFloat(growthRate.toFixed(1)),
      今日请求: todayCount,
      昨日请求: yesterdayCount,
      差值: difference,
      isFuture,
    };
  });

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label}`}</p>
          <p className="text-sm" style={{ color: payload[0]?.color }}>
            增长率: {data.增长率}%
          </p>
          <div className="border-t border-slate-200 mt-2 pt-2">
            <p className="text-sm text-slate-600">
              今日请求: {data.今日请求.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">
              昨日请求: {data.昨日请求.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">
              差值: {data.差值 > 0 ? '+' : ''}{data.差值.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 根据增长率和时间确定颜色
  const getBarColor = (value: number, isFuture: boolean) => {
    const baseOpacity = isFuture ? 0.4 : 1;
    if (value > 50) return isFuture ? '#ef444480' : '#ef4444'; // 红色 - 高增长
    if (value > 0) return isFuture ? '#10b98180' : '#10b981'; // 绿色 - 正增长
    if (value > -25) return isFuture ? '#f59e0b80' : '#f59e0b'; // 橙色 - 轻微下降
    return isFuture ? '#7c2d1280' : '#7c2d12'; // 棕色 - 大幅下降
  };

  return (
    <div className="w-full h-80 relative">
      {/* 颜色图例说明 - 右上角 */}
      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-slate-200">
        <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
            <span>&gt;50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
            <span>0-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
            <span>-25%-0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-900 rounded-sm"></div>
            <span>&lt;-25%</span>
          </div>
        </div>
      </div>

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
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="增长率" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.增长率, entry.isFuture)}
                stroke={entry.isFuture ? "#64748b" : "none"}
                strokeWidth={entry.isFuture ? 1 : 0}
                strokeDasharray={entry.isFuture ? "3 3" : "0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
