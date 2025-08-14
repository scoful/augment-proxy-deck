"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type HourlyData } from '@/server/api/routers/stats';

interface HourlyBarChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function HourlyBarChart({ todayData, yesterdayData }: HourlyBarChartProps) {
  // 合并今日和昨日数据
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const hour = new Date(today.hour).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    return {
      hour,
      今日用户: today.uniqueUsers,
      昨日用户: yesterday?.uniqueUsers || 0,
    };
  });

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{`时间: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value.toLocaleString()}人`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
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
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="今日用户" 
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
            name="今日用户"
          />
          <Bar 
            dataKey="昨日用户" 
            fill="#d1d5db" 
            radius={[2, 2, 0, 0]}
            name="昨日用户"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
