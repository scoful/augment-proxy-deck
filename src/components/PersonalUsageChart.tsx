import { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";

interface PersonalUsageChartProps {
  days: number;
}

export default function PersonalUsageChart({ days }: PersonalUsageChartProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actualSearchQuery, setActualSearchQuery] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 获取搜索结果
  const { data: searchResults, isLoading: searchLoading } =
    api.history.getActiveUserList.useQuery(
      {
        limit: 20, // 搜索结果限制
        days,
        search: actualSearchQuery.trim() || undefined, // 只有有搜索内容时才传递
      },
      {
        enabled: !!actualSearchQuery.trim(), // 只有有搜索内容时才查询
      },
    );

  // 选择用户
  const selectUser = (user: any) => {
    setSelectedUserId(user.userId);
    setSelectedUserData(user); // 保存用户数据
    setSearchQuery(user.displayName || user.userId);
    setShowResults(false);
  };

  // 清空选择
  const clearSelection = () => {
    setSelectedUserId("");
    setSelectedUserData(null);
    setSearchQuery("");
    setActualSearchQuery("");
    setShowResults(false);
  };

  // 处理搜索提交
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setActualSearchQuery(searchQuery.trim());
      setShowResults(true);
    }
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // 点击外部关闭结果列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 获取选中用户的趋势数据
  const { data: userTrends, isLoading: trendsLoading } =
    api.history.getUserActivityTrends.useQuery(
      {
        days,
        userId: selectedUserId,
      },
      {
        enabled: !!selectedUserId,
      },
    );

  // 处理图表数据 - 只显示24小时数据（数据库中实际存在的字段）
  const chartData =
    userTrends?.map((trend) => ({
      date: trend.dataDate,
      count24Hour: "count24Hour" in trend ? trend.count24Hour : 0,
      rank24Hour: "rank24Hour" in trend ? trend.rank24Hour : 0,
    })) || [];

  // 自定义Tooltip - 简化显示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-slate-800">{`日期: ${label}`}</p>
          <p className="text-sm text-blue-600">
            请求量: {formatNumber(data.count24Hour)}
          </p>
          <p className="text-sm text-slate-600">
            排名: {formatNumber(data.rank24Hour)} 名
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">
          个人用量趋势
        </h3>
        <p className="text-sm text-slate-600">显示用户请求量的历史变化趋势</p>

        {/* 用户搜索选择器 */}
        <div className="mb-4" ref={searchRef}>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            搜索用户
          </label>

          {/* 搜索框 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    clearSelection();
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="输入用户名或ID..."
                className="w-full rounded-lg border border-slate-300 py-2 pr-10 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                disabled={searchLoading}
              />
              {selectedUserId && (
                <button
                  onClick={clearSelection}
                  className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              disabled={!searchQuery.trim() || searchLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              搜索
            </button>
          </div>

          {/* 搜索结果列表 */}
          {showResults && actualSearchQuery.trim() && (
            <div className="mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchLoading ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  搜索中...
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => selectUser(user)}
                    className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    <div className="font-medium text-slate-800">
                      {user.displayName || user.userId}
                    </div>
                    <div className="text-xs text-slate-500">
                      总计: {formatNumber(user.totalCount)} | 平均:{" "}
                      {formatNumber(user.avgCount)}/日
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">
                  未找到匹配的用户，请尝试其他关键词
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 图表区域 */}
      {!selectedUserId ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>请选择用户查看个人用量趋势</p>
          </div>
        </div>
      ) : trendsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-500">加载中...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-slate-500">
            <p>该用户在选定时间范围内暂无数据</p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count24Hour"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 用户信息和使用模式识别 */}
      {selectedUserId && selectedUserData && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {(() => {
            const selectedUser = selectedUserData;
            if (!selectedUser) return null;

            // 使用模式识别
            const avgCount = selectedUser.avgCount;
            let usagePattern = "";
            let patternColor = "";

            if (avgCount >= 200) {
              usagePattern = "🔥 卷王";
              patternColor = "text-purple-600";
            } else if (avgCount >= 100) {
              usagePattern = "👑 大佬";
              patternColor = "text-red-600";
            } else if (avgCount >= 50) {
              usagePattern = "⚡ 活跃分子";
              patternColor = "text-orange-600";
            } else if (avgCount >= 10) {
              usagePattern = "🧘 佛系用户";
              patternColor = "text-blue-600";
            } else {
              usagePattern = "👻 路人甲";
              patternColor = "text-slate-600";
            }

            return (
              <div className="space-y-3">
                {/* 基础信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">用户</p>
                    <p className="font-medium text-slate-800">
                      {selectedUser.displayName || selectedUser.userId}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">使用模式</p>
                    <p className={`font-medium ${patternColor}`}>
                      {usagePattern}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">累计总请求量</p>
                    <p className="font-medium text-slate-800">
                      {formatNumber(selectedUser.totalCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">平均日请求量</p>
                    <p className="font-medium text-slate-800">
                      {formatNumber(selectedUser.avgCount)}
                    </p>
                  </div>
                </div>

                {/* 活跃度分析 */}
                <div className="border-t border-slate-100 pt-2">
                  <p className="text-xs text-slate-500">
                    最后活跃: {selectedUser.lastActiveDate}
                  </p>
                  {chartData.length > 1 && (
                    <div className="mt-1 text-xs text-slate-600">
                      {(() => {
                        const recent = chartData[chartData.length - 1];
                        const previous = chartData[chartData.length - 2];
                        if (!recent || !previous) return null;

                        const trend = recent.count24Hour - previous.count24Hour;
                        const trendPercent =
                          previous.count24Hour > 0
                            ? ((trend / previous.count24Hour) * 100).toFixed(1)
                            : "0";

                        if (Math.abs(trend) < 1) {
                          return <span>与前一天相比保持稳定</span>;
                        } else if (trend > 0) {
                          return (
                            <span className="text-green-600">
                              ↗ 较前一天上升 {trendPercent}%
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-red-600">
                              ↘ 较前一天下降{" "}
                              {Math.abs(parseFloat(trendPercent))}%
                            </span>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
