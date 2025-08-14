"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { type HourlyData } from '@/server/api/routers/stats';

interface PeakValleyChartProps {
  todayData: HourlyData[];
  yesterdayData: HourlyData[];
}

export default function PeakValleyChart({ todayData, yesterdayData }: PeakValleyChartProps) {
  // 获取当前时间
  const currentHour = new Date().getHours();
  
  // 合并今日和昨日数据
  const chartData = todayData.map((today, index) => {
    const yesterday = yesterdayData[index];
    const dataHour = new Date(today.hour).getHours();
    const hour = new Date(today.hour).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const isFuture = dataHour > currentHour;
    
    return {
      hour,
      今日请求: today.count,
      昨日请求: yesterday?.count || 0,
      isFuture,
      hourIndex: dataHour,
    };
  });

  // 找出峰值和谷值
  const findPeaksAndValleys = (data: typeof chartData, key: '今日请求' | '昨日请求') => {
    const values = data.map(d => d[key]);
    const peaks: Array<{hour: string, value: number, hourIndex: number}> = [];
    const valleys: Array<{hour: string, value: number, hourIndex: number}> = [];
    
    for (let i = 1; i < values.length - 1; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      const next = values[i + 1];
      
      // 峰值：比前后都高，且值大于平均值
      if (curr > prev && curr > next && curr > 0) {
        peaks.push({
          hour: data[i].hour,
          value: curr,
          hourIndex: data[i].hourIndex
        });
      }
      
      // 谷值：比前后都低
      if (curr < prev && curr < next) {
        valleys.push({
          hour: data[i].hour,
          value: curr,
          hourIndex: data[i].hourIndex
        });
      }
    }
    
    // 只保留最显著的峰值和谷值
    const sortedPeaks = peaks.sort((a, b) => b.value - a.value).slice(0, 3);
    const sortedValleys = valleys.sort((a, b) => a.value - b.value).slice(0, 2);
    
    return { peaks: sortedPeaks, valleys: sortedValleys };
  };

  const todayPeaksValleys = findPeaksAndValleys(chartData, '今日请求');
  const yesterdayPeaksValleys = findPeaksAndValleys(chartData, '昨日请求');

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
          
          {/* 今日请求线 */}
          <Line 
            type="monotone" 
            dataKey="今日请求" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          
          {/* 昨日请求线 */}
          <Line 
            type="monotone" 
            dataKey="昨日请求" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, stroke: '#94a3b8', strokeWidth: 2 }}
          />
          
          {/* 今日峰值标记 */}
          {todayPeaksValleys.peaks.map((peak, index) => (
            <ReferenceDot
              key={`today-peak-${index}`}
              x={peak.hour}
              y={peak.value}
              r={6}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
          
          {/* 今日谷值标记 */}
          {todayPeaksValleys.valleys.map((valley, index) => (
            <ReferenceDot
              key={`today-valley-${index}`}
              x={valley.hour}
              y={valley.value}
              r={6}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
          
          {/* 昨日峰值标记 */}
          {yesterdayPeaksValleys.peaks.map((peak, index) => (
            <ReferenceDot
              key={`yesterday-peak-${index}`}
              x={peak.hour}
              y={peak.value}
              r={5}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* 峰谷说明 */}
      <div className="flex justify-center mt-2 gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>今日峰值</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>今日谷值</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>昨日峰值</span>
        </div>
      </div>
    </div>
  );
}
