import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";

interface UserBehaviorAnomalyChartProps {
  days: number;
}

export default function UserBehaviorAnomalyChart({
  days,
}: UserBehaviorAnomalyChartProps) {
  // 获取用户行为异常检测数据
  const { data: anomalyData, isLoading } =
    api.history.getUserBehaviorAnomalies.useQuery({
      days,
    });

  // 处理散点图数据
  const processScatterData = () => {
    if (!anomalyData) return { normalUsers: [], surgeUsers: [], extremeUsers: [] };

    const normalUsers = anomalyData.users
      .filter((user) => user.surgeLevel === 'normal')
      .map((user) => ({
        x: user.avgDailyRequests,
        y: user.changeRate,
        name: user.displayName,
        userId: user.userId,
        totalRequests: user.totalRequests,
        recentAvg: user.recentAvg,
        previousAvg: user.previousAvg,
        zScore: user.zScore,
      }));

    const surgeUsers = anomalyData.users
      .filter((user) => user.surgeLevel === 'moderate')
      .map((user) => ({
        x: user.avgDailyRequests,
        y: user.changeRate,
        name: user.displayName,
        userId: user.userId,
        totalRequests: user.totalRequests,
        recentAvg: user.recentAvg,
        previousAvg: user.previousAvg,
        zScore: user.zScore,
      }));

    const extremeUsers = anomalyData.users
      .filter((user) => user.surgeLevel === 'extreme')
      .map((user) => ({
        x: user.avgDailyRequests,
        y: user.changeRate,
        name: user.displayName,
        userId: user.userId,
        totalRequests: user.totalRequests,
        recentAvg: user.recentAvg,
        previousAvg: user.previousAvg,
        zScore: user.zScore,
      }));

    return { normalUsers, surgeUsers, extremeUsers };
  };

  const { normalUsers, surgeUsers, extremeUsers } = processScatterData();

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{data.name}</p>
          <div className="mt-1 space-y-1 text-sm text-slate-600">
            <p>平均日请求: {formatNumber(data.x)}</p>
            <p>变化率: {data.y.toFixed(1)}%</p>
            <p>最近平均: {formatNumber(data.recentAvg)}</p>
            <p>之前平均: {formatNumber(data.previousAvg)}</p>
            <p>变化分数: {data.zScore.toFixed(2)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">用户行为变化检测</h3>
        <p className="text-sm text-slate-600">
          识别最近请求量突然增长的用户（对比前后两个时间段）
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : !anomalyData || anomalyData.users.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>暂无数据</p>
            {anomalyData && (
              <p className="text-xs mt-2">
                检测到 {anomalyData.statistics.totalUsers} 个用户，
                时间范围：前{anomalyData.statistics.timeRange?.previousDays}天 vs 后{anomalyData.statistics.timeRange?.recentDays}天
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="平均日请求量"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="变化率(%)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* 突增阈值线 */}
                {anomalyData.statistics.surgeThreshold && (
                  <ReferenceLine
                    y={anomalyData.statistics.surgeThreshold}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{ value: "突增阈值", position: "topRight" }}
                  />
                )}

                {/* 0%变化线 */}
                <ReferenceLine
                  y={0}
                  stroke="#64748b"
                  strokeDasharray="2 2"
                  label={{ value: "无变化", position: "left" }}
                />

                {/* 常规用户 */}
                <Scatter
                  name="常规用户"
                  data={normalUsers}
                  fill="#10b981"
                  fillOpacity={0.6}
                />

                {/* 突增用户 */}
                <Scatter
                  name="突增用户"
                  data={surgeUsers}
                  fill="#f59e0b"
                  fillOpacity={0.8}
                />

                {/* 极度突增用户 */}
                <Scatter
                  name="极度突增用户"
                  data={extremeUsers}
                  fill="#ef4444"
                  fillOpacity={0.9}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* 统计信息 */}
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-slate-600">总用户数</p>
                <p className="font-medium text-slate-800">
                  {formatNumber(anomalyData.statistics.totalUsers)}
                </p>
              </div>
              <div>
                <p className="text-slate-600">突增用户</p>
                <p className="font-medium text-red-600">
                  {formatNumber(anomalyData.statistics.surgeCount)}
                </p>
              </div>
              <div>
                <p className="text-slate-600">突增比例</p>
                <p className="font-medium text-orange-600">
                  {((anomalyData.statistics.surgeCount / anomalyData.statistics.totalUsers) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-600">突增阈值</p>
                <p className="font-medium text-slate-800">
                  {anomalyData.statistics.surgeThreshold.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* 突增用户列表 */}
          {(surgeUsers.length > 0 || extremeUsers.length > 0) && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="mb-2 text-sm font-medium text-slate-800">突增用户列表</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {extremeUsers.map((user, index) => (
                  <div key={`extreme-${index}`} className="flex items-center justify-between rounded bg-red-50 px-2 py-1 text-xs">
                    <span className="font-medium text-red-800">{user.name}</span>
                    <span className="text-red-600">+{user.y.toFixed(1)}%</span>
                  </div>
                ))}
                {surgeUsers.map((user, index) => (
                  <div key={`surge-${index}`} className="flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-xs">
                    <span className="font-medium text-orange-800">{user.name}</span>
                    <span className="text-orange-600">+{user.y.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
