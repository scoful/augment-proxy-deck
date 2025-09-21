import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import { ACTIVITY_LEVELS, getFormattedActivityName } from "@/utils/activityLevels";
import { useMemo } from "react";

interface UserActivityDistributionChartProps {
  days: number;
}

export default function UserActivityDistributionChart({
  days,
}: UserActivityDistributionChartProps) {
  // 获取用户活跃度分布数据
  const { data: distribution, isLoading } =
    api.history.getUserActivityDistribution.useQuery({
      days,
    });

  // 处理图表数据（memo，避免渲染期副作用）
  const chartData = useMemo(
    () =>
      distribution
        ? [
            {
              name: getFormattedActivityName(ACTIVITY_LEVELS[0]!),
              value: distribution.超重度用户,
              color: ACTIVITY_LEVELS[0]!.color,
              description: ACTIVITY_LEVELS[0]!.description,
            },
            {
              name: getFormattedActivityName(ACTIVITY_LEVELS[1]!),
              value: distribution.重度用户,
              color: ACTIVITY_LEVELS[1]!.color,
              description: ACTIVITY_LEVELS[1]!.description,
            },
            {
              name: getFormattedActivityName(ACTIVITY_LEVELS[2]!),
              value: distribution.中度用户,
              color: ACTIVITY_LEVELS[2]!.color,
              description: ACTIVITY_LEVELS[2]!.description,
            },
            {
              name: getFormattedActivityName(ACTIVITY_LEVELS[3]!),
              value: distribution.轻度用户,
              color: ACTIVITY_LEVELS[3]!.color,
              description: ACTIVITY_LEVELS[3]!.description,
            },
            {
              name: getFormattedActivityName(ACTIVITY_LEVELS[4]!),
              value: distribution.偶尔使用,
              color: ACTIVITY_LEVELS[4]!.color,
              description: ACTIVITY_LEVELS[4]!.description,
            },
          ].filter((item) => item.value > 0)
        : [],
    [distribution]
  );
  const totalUsers = chartData.reduce((sum, item) => sum + item.value, 0);

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      const percentage =
        totalUsers > 0 ? ((data.value / totalUsers) * 100).toFixed(1) : "0";

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">{data.description}</p>
          <p className="text-sm" style={{ color: data.color }}>
            用户数: {formatNumber(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">用户活跃度分布</h3>
        <p className="text-sm text-slate-600">
          按平均日请求量分类的用户群体分布
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>暂无数据</p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 统计信息 */}
      {chartData.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">总用户数</p>
              <p className="font-medium text-slate-800">
                {formatNumber(totalUsers)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">最大群体</p>
              {chartData.length > 0 && (
                (() => {
                  const top = chartData.reduce((m, c) => (c.value > m.value ? c : m), chartData[0]!);
                  return (
                    <p className="font-medium" style={{ color: top.color }}>
                      {top.name}
                    </p>
                  );
                })()
              )}
            </div>
            <div>
              <p className="text-slate-600">总用户数</p>
              <p className="font-medium text-green-600">
                {formatNumber(totalUsers)}
              </p>
            </div>
          </div>

          {/* 图例标准说明 */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-medium text-slate-700">活跃度分类标准</h4>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              {ACTIVITY_LEVELS.map((level) => (
                <div key={level.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: level.color }}></div>
                  <div>
                    <span className="font-medium">{getFormattedActivityName(level)}</span>
                    <p className="text-slate-600">{level.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              * 基于用户在选定时间范围内的平均日请求量进行分类
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
