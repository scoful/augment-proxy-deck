import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  ArrowUpIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import {
  formatDisplayName,
  formatNumber,
  formatDateTime,
} from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";
import { type UserStats as UserStatsType } from "@/server/api/routers/stats";

import { useState, useEffect, useRef } from "react";

export default function UserStats() {
  const [limit, setLimit] = useState(200);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof UserStatsType | null>(
    "count24Hour",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: userStats,
    isLoading,
    error,
    isFetching,
  } = api.stats.getUserStats.useQuery(
    { limit },
    {
      // 启用轮询，每60秒更新一次数据
      refetchInterval: POLLING_INTERVALS.USER_STATS,
      ...QUERY_CONFIG,
    },
  );

  // 监听滚动事件，显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 监听快捷键，Ctrl+F 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 排序功能
  const handleSort = (field: keyof UserStatsType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 过滤和排序用户数据
  const filteredUsers =
    userStats?.allUsers
      .filter((user) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
          user.displayName.toLowerCase().includes(query) ||
          user.userId.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (!sortField) return 0;

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      }) ?? [];

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="rounded bg-yellow-200 px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  // 可排序表头组件
  const SortableHeader = ({
    field,
    children,
  }: {
    field: keyof UserStatsType;
    children: React.ReactNode;
  }) => (
    <th
      className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase transition-colors hover:bg-slate-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? (
            <ChevronUpIcon className="h-3 w-3" />
          ) : (
            <ChevronDownIcon className="h-3 w-3" />
          ))}
      </div>
    </th>
  );
  return (
    <>
      <Head>
        <title>设备统计 | Augment Proxy Deck</title>
        <meta name="description" content="设备注册、活跃度等相关统计数据" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-800"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>返回首页</span>
              </Link>
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">设备统计</h1>
                {isFetching && (
                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                    <span className="text-xs text-blue-600">更新中...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-2 text-slate-600">加载中...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-red-800">加载数据失败: {error.message}</p>
            </div>
          )}

          {/* Data Display */}
          {userStats && (
            <>
              {/* Update Time Info */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-500">
                    数据更新时间: {formatDateTime(userStats.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span>每60秒自动更新</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 1小时活跃设备 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时活跃设备</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(userStats.summary.totalUsers1Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去1小时</span>
                  </div>
                </div>

                {/* 24小时活跃设备 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时活跃设备</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(userStats.summary.totalUsers24Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去24小时</span>
                  </div>
                </div>

                {/* 1小时总请求 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时总请求</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(userStats.summary.totalCount1Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <ClockIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去1小时</span>
                  </div>
                </div>

                {/* 24小时总请求 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时总请求</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(userStats.summary.totalCount24Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <UserGroupIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去24小时</span>
                  </div>
                </div>
              </div>

              {/* Top Users Section */}
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Top Users - 24 Hour */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      24小时排行榜
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {userStats.topUsers.slice(0, 10).map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {index < 3 ? (
                            <div className="flex h-8 w-8 items-center justify-center text-xl">
                              {index === 0 && "🥇"}
                              {index === 1 && "🥈"}
                              {index === 2 && "🥉"}
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                              {index + 1}
                            </div>
                          )}
                          <div>
                            <p
                              className="font-medium text-slate-800"
                              title={user.displayName}
                            >
                              {formatDisplayName(user.displayName)}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {user.userId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">
                            {user.count24Hour}
                          </p>
                          <p className="text-xs text-slate-500">请求数</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Users - 1 Hour */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      1小时排行榜
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {userStats.topUsers
                      .filter((user) => user.count1Hour > 0)
                      .sort((a, b) => b.count1Hour - a.count1Hour)
                      .slice(0, 10)
                      .map((user, index) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            {index < 3 ? (
                              <div className="flex h-8 w-8 items-center justify-center text-xl">
                                {index === 0 && "🥇"}
                                {index === 1 && "🥈"}
                                {index === 2 && "🥉"}
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                                {index + 1}
                              </div>
                            )}
                            <div>
                              <p
                                className="font-medium text-slate-800"
                                title={user.displayName}
                              >
                                {formatDisplayName(user.displayName)}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {user.userId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">
                              {user.count1Hour}
                            </p>
                            <p className="text-xs text-slate-500">请求数</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* All Users Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      所有用户详情
                      {searchQuery && (
                        <span className="ml-2 text-sm text-slate-500">
                          (找到 {filteredUsers.length} 个结果)
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4">
                      {/* 搜索框 */}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="search"
                          className="text-sm text-slate-600"
                        >
                          搜索:
                        </label>
                        <input
                          ref={searchInputRef}
                          id="search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="用户名、ID、姓名..."
                          className="w-48 rounded border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-sm text-slate-400 hover:text-slate-600"
                            title="清除搜索"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* 显示条数 */}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="limit"
                          className="text-sm text-slate-600"
                        >
                          显示条数:
                        </label>
                        <select
                          id="limit"
                          value={limit}
                          onChange={(e) => setLimit(Number(e.target.value))}
                          className="rounded border border-slate-300 px-2 py-1 text-sm"
                        >
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={200}>200</option>
                          <option value={500}>500</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    💡 使用搜索功能快速查找特定用户，支持用户名、ID、姓名搜索 |
                    快捷键: Ctrl+F (Mac: Cmd+F)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <SortableHeader field="displayName">
                          用户信息
                        </SortableHeader>
                        <SortableHeader field="count1Hour">
                          1小时请求数
                        </SortableHeader>
                        <SortableHeader field="count24Hour">
                          24小时请求数
                        </SortableHeader>
                        <SortableHeader field="rank1Hour">
                          1小时排名
                        </SortableHeader>
                        <SortableHeader field="rank24Hour">
                          24小时排名
                        </SortableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.userId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div
                                  className="text-sm font-medium text-slate-900"
                                  title={user.displayName}
                                >
                                  {highlightText(
                                    formatDisplayName(user.displayName),
                                    searchQuery,
                                  )}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {highlightText(user.userId, searchQuery)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  user.count1Hour > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.count1Hour}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                              <span className="font-semibold">
                                {user.count24Hour}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                              {user.rank1Hour > 0 ? `#${user.rank1Hour}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  user.rank24Hour <= 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : user.rank24Hour <= 10
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                #{user.rank24Hour}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            {searchQuery
                              ? `没有找到包含 "${searchQuery}" 的用户`
                              : "暂无数据"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 回到顶部按钮 */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed right-8 bottom-8 z-30 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-blue-700"
            aria-label="回到顶部"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}
      </main>
    </>
  );
}
