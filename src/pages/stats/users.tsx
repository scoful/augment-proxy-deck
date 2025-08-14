import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, UserGroupIcon, ClockIcon, TrophyIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatDisplayName, formatNumber, formatDateTime, formatPercentage } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";

import { useState, useEffect, useRef } from "react";

export default function UserStats() {
  const [limit, setLimit] = useState(200);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: userStats, isLoading, error, isFetching } = api.stats.getUserStats.useQuery(
    { limit },
    {
      // 启用轮询，每60秒更新一次数据
      refetchInterval: POLLING_INTERVALS.USER_STATS,
      ...QUERY_CONFIG,
    }
  );

  // 监听滚动事件，显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 监听快捷键，Ctrl+F 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 过滤用户数据
  const filteredUsers = userStats?.allUsers.filter(user => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.userId.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query)
    );
  }) || [];

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };
  return (
    <>
      <Head>
        <title>用户统计 | Augment Proxy Deck</title>
        <meta name="description" content="用户注册、活跃度等相关统计数据" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>返回首页</span>
              </Link>
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">用户统计</h1>
                {isFetching && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-slate-600">加载中...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
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
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>每60秒自动更新</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 1小时活跃用户 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时活跃用户</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(userStats.summary.totalUsers1Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去1小时</span>
                  </div>
                </div>

                {/* 24小时活跃用户 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时活跃用户</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(userStats.summary.totalUsers24Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去24小时</span>
                  </div>
                </div>

                {/* 1小时总请求 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时总请求</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(userStats.summary.totalCount1Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去1小时</span>
                  </div>
                </div>

                {/* 24小时总请求 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时总请求</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(userStats.summary.totalCount24Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">过去24小时</span>
                  </div>
                </div>
              </div>



              {/* Top Users Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Users - 24 Hour */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-slate-800">24小时排行榜</h3>
                  </div>
                  <div className="space-y-3">
                    {userStats.topUsers.slice(0, 10).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800" title={user.displayName}>
                              {formatDisplayName(user.displayName)}
                            </p>
                            <p className="text-xs text-slate-500">ID: {user.userId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">{user.count24Hour}</p>
                          <p className="text-xs text-slate-500">请求数</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Users - 1 Hour */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">1小时排行榜</h3>
                  </div>
                  <div className="space-y-3">
                    {userStats.topUsers
                      .filter(user => user.count1Hour > 0)
                      .sort((a, b) => b.count1Hour - a.count1Hour)
                      .slice(0, 10)
                      .map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800" title={user.displayName}>
                                {formatDisplayName(user.displayName)}
                              </p>
                              <p className="text-xs text-slate-500">ID: {user.userId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">{user.count1Hour}</p>
                            <p className="text-xs text-slate-500">请求数</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* All Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
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
                        <label htmlFor="search" className="text-sm text-slate-600">搜索:</label>
                        <input
                          ref={searchInputRef}
                          id="search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="用户名、ID、姓名..."
                          className="border border-slate-300 rounded px-3 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-slate-400 hover:text-slate-600 text-sm"
                            title="清除搜索"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* 显示条数 */}
                      <div className="flex items-center gap-2">
                        <label htmlFor="limit" className="text-sm text-slate-600">显示条数:</label>
                        <select
                          id="limit"
                          value={limit}
                          onChange={(e) => setLimit(Number(e.target.value))}
                          className="border border-slate-300 rounded px-2 py-1 text-sm"
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
                    💡 使用搜索功能快速查找特定用户，支持用户名、ID、姓名搜索 | 快捷键: Ctrl+F (Mac: Cmd+F)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          用户信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          1小时请求数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          24小时请求数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          1小时排名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          24小时排名
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user.userId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900" title={user.displayName}>
                                  {highlightText(formatDisplayName(user.displayName), searchQuery)}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {highlightText(user.userId, searchQuery)}
                                </div>
                                {(user.firstName || user.lastName) && (
                                  <div className="text-xs text-slate-400">
                                    {highlightText(`${user.firstName} ${user.lastName}`, searchQuery)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.count1Hour > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {user.count1Hour}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className="font-semibold">{user.count24Hour}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {user.rank1Hour > 0 ? `#${user.rank1Hour}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.rank24Hour <= 3
                                  ? "bg-yellow-100 text-yellow-800"
                                  : user.rank24Hour <= 10
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                #{user.rank24Hour}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            {searchQuery ? `没有找到包含 "${searchQuery}" 的用户` : '暂无数据'}
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
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-30"
            aria-label="回到顶部"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}
      </main>
    </>
  );
}
