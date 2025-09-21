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
import { getActivityLevelByAvgRequests, getFormattedActivityName } from "@/utils/activityLevels";

// 记住用户的数据结构
interface RememberedUser {
  userId: string;
  displayName: string;
  lastSelected: number;
  expiresAt: number;
}

// localStorage key
const REMEMBERED_USER_KEY = "personalUsageChart_rememberedUser";

interface PersonalUsageChartProps {
  days: number;
}

export default function PersonalUsageChart({ days }: PersonalUsageChartProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actualSearchQuery, setActualSearchQuery] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [rememberedUser, setRememberedUser] = useState<RememberedUser | null>(
    null,
  );
  const searchRef = useRef<HTMLDivElement>(null);

  // 工具函数：保存记住的用户
  const saveRememberedUser = (
    user: any,
    shouldRemember: boolean = rememberMe,
  ) => {
    if (!shouldRemember) return;

    const rememberedData: RememberedUser = {
      userId: user.userId,
      displayName: user.displayName || user.userId,
      lastSelected: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后过期
    };

    try {
      localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify(rememberedData));
      setRememberedUser(rememberedData);
    } catch (error) {
      console.warn("无法保存记住的用户:", error);
    }
  };

  // 工具函数：加载记住的用户
  const loadRememberedUser = (): RememberedUser | null => {
    try {
      const saved = localStorage.getItem(REMEMBERED_USER_KEY);
      if (!saved) return null;

      const data: RememberedUser = JSON.parse(saved);

      // 检查是否过期
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(REMEMBERED_USER_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("无法加载记住的用户:", error);
      localStorage.removeItem(REMEMBERED_USER_KEY);
      return null;
    }
  };

  // 工具函数：清除记住的用户
  const forgetRememberedUser = () => {
    try {
      localStorage.removeItem(REMEMBERED_USER_KEY);
      setRememberedUser(null);
      setRememberMe(false);
    } catch (error) {
      console.warn("无法清除记住的用户:", error);
    }
  };

  // 工具函数：格式化时间显示
  const formatLastSelectedTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor(diff / (60 * 1000));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return "刚刚";
  };

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

    // 如果开启了记住功能，保存用户信息
    saveRememberedUser(user);
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

  // 组件初始化时加载记住的用户
  useEffect(() => {
    const remembered = loadRememberedUser();
    if (remembered) {
      setRememberedUser(remembered);
      setRememberMe(true);

      // 自动选择记住的用户
      setSelectedUserId(remembered.userId);
      setSearchQuery(remembered.displayName);
      setSelectedUserData({
        userId: remembered.userId,
        displayName: remembered.displayName,
      });
    }
  }, []);

  // 监听rememberMe状态变化
  useEffect(() => {
    if (!rememberMe && rememberedUser) {
      // 如果取消勾选"记住我"，清除记住的用户
      forgetRememberedUser();
    } else if (rememberMe && selectedUserData && !rememberedUser) {
      // 如果勾选"记住我"且当前有选中用户但没有记住，立即保存
      saveRememberedUser(selectedUserData, true);
    }
  }, [rememberMe, rememberedUser, selectedUserData]);

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

  // 获取选中用户的完整统计信息
  const { data: userCompleteStats, isLoading: statsLoading } =
    api.history.getUserCompleteStats.useQuery(
      {
        userId: selectedUserId,
        days,
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

          {/* 记住功能控制 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-600">
                记住我的选择
              </label>
            </div>

            {rememberedUser && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  记住: {rememberedUser.displayName} (
                  {formatLastSelectedTime(rememberedUser.lastSelected)})
                </span>
                <button
                  onClick={forgetRememberedUser}
                  className="cursor-pointer rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  忘记
                </button>
              </div>
            )}
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
      ) : trendsLoading || statsLoading ? (
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
      {selectedUserId && (userCompleteStats || selectedUserData) && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {(() => {
            // 优先使用完整统计数据，否则使用搜索结果数据
            const selectedUser = userCompleteStats || selectedUserData;
            if (!selectedUser) return null;

            // 活跃度识别
            const avgCount = selectedUser.avgCount;
            const activityLevelData = getActivityLevelByAvgRequests(avgCount);
            const activityLevel = getFormattedActivityName(activityLevelData);
            const activityColor = activityLevelData.textColor;

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
                    <p className="text-slate-600">活跃度</p>
                    <p className={`font-medium ${activityColor}`}>
                      {activityLevel}
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
