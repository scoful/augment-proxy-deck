import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { api } from "@/utils/api";
import { formatDateTime, formatNumber } from "@/utils/formatters";

export default function HistoryPage() {
  const [selectedDays, setSelectedDays] = useState(7);

  // 获取数据概览
  const { data: dataOverview, isLoading: overviewLoading } = api.history.getDataOverview.useQuery();

  // 获取用户活跃度趋势
  const { data: userTrends, isLoading: userTrendsLoading } = api.history.getUserActivityTrends.useQuery({
    days: selectedDays,
  });

  // 获取车辆存活率趋势
  const { data: vehicleTrends, isLoading: vehicleTrendsLoading } = api.history.getVehicleSurvivalTrends.useQuery({
    days: selectedDays,
  });

  // 获取系统请求趋势
  const { data: systemTrends, isLoading: systemTrendsLoading } = api.history.getSystemRequestTrends.useQuery({
    days: selectedDays,
  });

  // 获取社车vs黑车对比
  const { data: comparisonData, isLoading: comparisonLoading } = api.history.getSocialVsBlackComparison.useQuery({
    days: selectedDays,
  });

  const dayOptions = [
    { value: 7, label: "最近7天" },
    { value: 14, label: "最近14天" },
    { value: 30, label: "最近30天" },
    { value: 90, label: "最近90天" },
  ];

  return (
    <>
      <Head>
        <title>历史统计 | Augment Proxy Deck</title>
        <meta name="description" content="查看历史数据趋势和长期分析" />
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
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-slate-800">历史统计</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* 时间范围选择器 */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">数据趋势分析</h2>
              <p className="text-slate-600">选择时间范围查看历史数据趋势</p>
            </div>
            <div className="flex gap-2">
              {dayOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDays(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDays === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

        {/* 数据概览卡片 */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">用户记录</p>
                <p className="text-2xl font-bold text-slate-800">
                  {overviewLoading ? "..." : formatNumber(dataOverview?.recordCounts.userDetail || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <TruckIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">车辆记录</p>
                <p className="text-2xl font-bold text-slate-800">
                  {overviewLoading ? "..." : formatNumber(dataOverview?.recordCounts.vehicleDetail || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">系统记录</p>
                <p className="text-2xl font-bold text-slate-800">
                  {overviewLoading ? "..." : formatNumber(dataOverview?.recordCounts.systemDetail || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">最新数据</p>
                <p className="text-lg font-bold text-slate-800">
                  {overviewLoading ? "..." : (dataOverview?.latestDates.user || "暂无")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 趋势图表区域 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 用户活跃度趋势 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">用户活跃度趋势</h3>
            </div>
            {userTrendsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500">加载中...</div>
              </div>
            ) : userTrends && userTrends.length > 0 ? (
              <div className="space-y-3">
                {userTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-medium text-slate-800">{trend.dataDate}</p>
                      <p className="text-sm text-slate-600">
                        1h: {formatNumber(trend.totalUsers1Hour)} | 24h: {formatNumber(trend.totalUsers24Hour)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">请求量</p>
                      <p className="font-medium text-slate-800">
                        {formatNumber(trend.totalCount24Hour)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center text-slate-500">
                  <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2">暂无数据</p>
                </div>
              </div>
            )}
          </div>

          {/* 车辆存活率趋势 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <TruckIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-800">车辆存活率趋势</h3>
            </div>
            {vehicleTrendsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500">加载中...</div>
              </div>
            ) : vehicleTrends && vehicleTrends.length > 0 ? (
              <div className="space-y-3">
                {vehicleTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-medium text-slate-800">{trend.dataDate}</p>
                      <p className="text-sm text-slate-600">
                        总数: {formatNumber(trend.totalCars)} | 活跃: {formatNumber(trend.activeCars)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">存活率</p>
                      <p className="font-medium text-slate-800">
                        {trend.survivalRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center text-slate-500">
                  <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2">暂无数据</p>
                </div>
              </div>
            )}
          </div>

          {/* 系统请求趋势 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <ClockIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">系统请求趋势</h3>
            </div>
            {systemTrendsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500">加载中...</div>
              </div>
            ) : systemTrends && systemTrends.length > 0 ? (
              <div className="space-y-3">
                {systemTrends.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-medium text-slate-800">{trend.dataDate}</p>
                      <p className="text-sm text-slate-600">
                        今日: {formatNumber(trend.todayTotal)} | 昨日: {formatNumber(trend.yesterdayTotal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">用户数</p>
                      <p className="font-medium text-slate-800">
                        {formatNumber(trend.todayUsers)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center text-slate-500">
                  <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2">暂无数据</p>
                </div>
              </div>
            )}
          </div>

          {/* 社车vs黑车对比 */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">社车vs黑车对比</h3>
            </div>
            {comparisonLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500">加载中...</div>
              </div>
            ) : comparisonData && comparisonData.length > 0 ? (
              <div className="space-y-3">
                {comparisonData.slice(0, 5).map((data, index) => (
                  <div key={index} className="border-b border-slate-100 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{data.dataDate}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        data.carType === 'social' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {data.carType === 'social' ? '社车' : '黑车'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                      <span>总数: {formatNumber(data.totalCars)} | 活跃: {formatNumber(data.activeCars)}</span>
                      <span>存活率: {data.survivalRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center text-slate-500">
                  <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2">暂无数据</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
