import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, UserGroupIcon, ClockIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatDisplayName, formatNumber, formatDateTime, formatPercentage } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";
import { useState } from "react";

export default function UserStats() {
  const [limit, setLimit] = useState(100);
  const { data: userStats, isLoading, error, isFetching } = api.stats.getUserStats.useQuery(
    { limit },
    {
      // 启用轮询，每30秒更新一次数据
      refetchInterval: POLLING_INTERVALS.USER_STATS,
      ...QUERY_CONFIG,
    }
  );
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
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {/* 用户总数 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">用户总数</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(userStats.allUsers.length)}</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      24h活跃率: {formatPercentage(userStats.summary.totalUsers24Hour, userStats.allUsers.length)}
                    </span>
                  </div>
                </div>
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

              {/* Update Time */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-500">
                    数据更新时间: {formatDateTime(userStats.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>每30秒自动更新</span>
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
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">所有用户详情</h3>
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
                      {userStats.allUsers.map((user, index) => (
                        <tr key={user.userId} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900" title={user.displayName}>
                                {formatDisplayName(user.displayName)}
                              </div>
                              <div className="text-sm text-slate-500">
                                ID: {user.userId}
                              </div>
                              {(user.firstName || user.lastName) && (
                                <div className="text-xs text-slate-400">
                                  {user.firstName} {user.lastName}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
