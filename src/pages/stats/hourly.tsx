import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber, formatDateTime } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";
import HourlyTrendChart from "@/components/HourlyTrendChart";
import HourlyBarChart from "@/components/HourlyBarChart";
import HourlyAreaChart from "@/components/HourlyAreaChart";
import GrowthRateChart from "@/components/GrowthRateChart";
import GrowthRadarChart from "@/components/GrowthRadarChart";
import CumulativeChart from "@/components/CumulativeChart";
import DensityHeatmap from "@/components/DensityHeatmap";
import { useState, useEffect } from "react";

export default function HourlyStats() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    data: hourlyStats,
    isLoading,
    error,
    isFetching,
  } = api.stats.getHourlyStats.useQuery(undefined, {
    // 启用轮询，每60秒更新一次数据
    refetchInterval: POLLING_INTERVALS.HOURLY_STATS,
    ...QUERY_CONFIG,
  });

  // 监听滚动事件，显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 格式化小时显示
  const formatHour = (hourString: string) => {
    const date = new Date(hourString);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 计算活跃度等级
  const getActivityLevel = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio >= 0.7) return { level: "高", color: "bg-red-100 text-red-800" };
    if (ratio >= 0.4)
      return { level: "中", color: "bg-yellow-100 text-yellow-800" };
    return { level: "低", color: "bg-green-100 text-green-800" };
  };

  return (
    <>
      <Head>
        <title>按小时统计 | Augment Proxy Deck</title>
        <meta name="description" content="查看按小时维度的各项数据统计" />
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
                <ClockIcon className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-slate-800">
                  按小时统计
                </h1>
                {isFetching && (
                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-xs text-green-600">更新中...</span>
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
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
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
          {hourlyStats && (
            <>
              {/* Update Time Info */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-500">
                    数据更新时间: {formatDateTime(hourlyStats.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span>每60秒自动更新</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 今日总请求 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">今日总请求</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(hourlyStats.summary.todayTotal)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="text-xs text-slate-500">
                      今日峰值: {formatNumber(Math.max(...hourlyStats.today.map((d) => d.count)))}
                    </div>
                    <div className="text-xs text-slate-500">
                      vs 昨日总数:{" "}
                      {hourlyStats.summary.todayTotal >
                      hourlyStats.summary.yesterdayTotal
                        ? "+"
                        : ""}
                      {(
                        ((hourlyStats.summary.todayTotal -
                          hourlyStats.summary.yesterdayTotal) /
                          hourlyStats.summary.yesterdayTotal) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-slate-500">
                      vs 昨日同比:{" "}
                      {(() => {
                        const currentHour = new Date().getHours();
                        const todayUpToNow = hourlyStats.today
                          .slice(0, currentHour + 1)
                          .reduce((sum, item) => sum + item.count, 0);
                        const yesterdayUpToSameTime = hourlyStats.yesterday
                          .slice(0, currentHour + 1)
                          .reduce((sum, item) => sum + item.count, 0);
                        const realTimeGrowth =
                          yesterdayUpToSameTime > 0
                            ? (
                                ((todayUpToNow - yesterdayUpToSameTime) /
                                  yesterdayUpToSameTime) *
                                100
                              ).toFixed(1)
                            : "0";
                        return `${todayUpToNow > yesterdayUpToSameTime ? "+" : ""}${realTimeGrowth}%`;
                      })()}
                    </div>
                  </div>
                </div>

                {/* 昨日总请求 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">昨日总请求</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(hourlyStats.summary.yesterdayTotal)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="text-xs text-slate-500">
                      昨日峰值: {formatNumber(Math.max(...hourlyStats.yesterday.map((d) => d.count)))}
                    </div>
                    <div className="text-xs text-slate-500">对比基准</div>
                  </div>
                </div>

                {/* 今日活跃用户 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">今日活跃用户</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(hourlyStats.summary.todayUsers)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      vs 昨日:{" "}
                      {hourlyStats.summary.todayUsers >
                      hourlyStats.summary.yesterdayUsers
                        ? "+"
                        : ""}
                      {hourlyStats.summary.todayUsers -
                        hourlyStats.summary.yesterdayUsers}
                      人
                    </span>
                  </div>
                </div>

                {/* 昨日活跃用户 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">昨日活跃用户</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(hourlyStats.summary.yesterdayUsers)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <UsersIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">对比基准</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="mb-8 space-y-8">
                {/* 第一行：今日vs昨日请求趋势 + 每小时增长率分析 */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* 请求趋势折线图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      今日vs昨日请求趋势
                    </h3>
                    <HourlyTrendChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>

                  {/* 增长率柱状图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      每小时增长率分析
                    </h3>
                    <GrowthRateChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>
                </div>

                {/* 第二行：今日vs昨日请求量对比 + 请求量趋势面积图 */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* 请求量对比柱状图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      今日vs昨日请求量对比
                    </h3>
                    <HourlyBarChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>

                  {/* 面积图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      请求量趋势面积图
                    </h3>
                    <HourlyAreaChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>
                </div>

                {/* 第三行：24小时增长率雷达 */}
                <div className="grid grid-cols-1 gap-8">
                  {/* 增长率雷达图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      24小时增长率雷达
                    </h3>
                    <GrowthRadarChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>
                </div>

                {/* 第四行：累积请求对比 */}
                <div className="grid grid-cols-1 gap-8">
                  {/* 累积请求对比图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      累积请求对比
                    </h3>
                    <CumulativeChart
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>
                </div>

                {/* 第五行：请求密度热力图 */}
                <div className="grid grid-cols-1 gap-8">
                  {/* 请求密度热力图 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      请求密度热力图
                    </h3>
                    <DensityHeatmap
                      todayData={hourlyStats.today}
                      yesterdayData={hourlyStats.yesterday}
                    />
                  </div>
                </div>
              </div>

              {/* Hourly Data Tables */}
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* 今日数据 */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      今日24小时数据
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-x-auto overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            时间
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            请求数
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            活跃度
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {hourlyStats.today.map((data, index) => {
                          const maxCount = Math.max(
                            ...hourlyStats.today.map((d) => d.count),
                          );
                          const activity = getActivityLevel(
                            data.count,
                            maxCount,
                          );
                          return (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                                {formatHour(data.hour)}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-500">
                                {formatNumber(data.count)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${activity.color}`}
                                >
                                  {activity.level}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 昨日数据 */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      昨日24小时数据
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-x-auto overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            时间
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            请求数
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                            活跃度
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {hourlyStats.yesterday.map((data, index) => {
                          const maxCount = Math.max(
                            ...hourlyStats.yesterday.map((d) => d.count),
                          );
                          const activity = getActivityLevel(
                            data.count,
                            maxCount,
                          );
                          return (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-slate-900">
                                {formatHour(data.hour)}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-500">
                                {formatNumber(data.count)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${activity.color}`}
                                >
                                  {activity.level}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 回到顶部按钮 */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed right-8 bottom-8 z-30 rounded-full bg-green-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-green-700"
            aria-label="回到顶部"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}
      </main>
    </>
  );
}
