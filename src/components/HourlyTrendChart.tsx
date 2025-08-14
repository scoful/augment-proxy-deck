"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type HourlyData } from '@/server/api/routers/stats';

interface HourlyTrendChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function HourlyTrendChart({ todayData, yesterdayData }: HourlyTrendChartProps) {
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
      今日请求: today.count,
      昨日请求: yesterday?.count || 0,
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
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
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
        <LineChart
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
          <Line 
            type="monotone" 
            dataKey="今日请求" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="昨日请求" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#94a3b8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#94a3b8', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
