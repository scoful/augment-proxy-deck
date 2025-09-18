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

  // 处理图表数据
  const chartData = distribution
    ? [
        {
          name: "🔥 卷王",
          value: distribution.超重度用户,
          color: "#9333ea",
          description: "≥200次/天",
        },
        {
          name: "👑 大佬",
          value: distribution.重度用户,
          color: "#dc2626",
          description: "100-199次/天",
        },
        {
          name: "⚡ 活跃分子",
          value: distribution.中度用户,
          color: "#ea580c",
          description: "50-99次/天",
        },
        {
          name: "🧘 佛系用户",
          value: distribution.轻度用户,
          color: "#2563eb",
          description: "10-49次/天",
        },
        {
          name: "👻 路人甲",
          value: distribution.偶尔使用,
          color: "#64748b",
          description: "<10次/天",
        },
      ].filter((item) => item.value > 0)
    : [];

  const totalUsers = chartData.reduce((sum, item) => sum + item.value, 0);

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      const percentage = totalUsers > 0 ? ((data.value / totalUsers) * 100).toFixed(1) : "0";
      
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
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
              <p className="font-medium" style={{ color: chartData[0]?.color }}>
                {chartData.sort((a, b) => b.value - a.value)[0]?.name}
              </p>
            </div>
            <div>
              <p className="text-slate-600">活跃用户占比</p>
              <p className="font-medium text-green-600">
                {(() => {
                  const activeUsers = chartData
                    .filter((item) => !item.name.includes("路人甲"))
                    .reduce((sum, item) => sum + item.value, 0);
                  return totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0";
                })()}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
