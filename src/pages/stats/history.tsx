import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import PersonalUsageChart from "@/components/PersonalUsageChart";
import SystemUsageChart from "@/components/SystemUsageChart";
import SystemPeakChart from "@/components/SystemPeakChart";
import SystemUsersChart from "@/components/SystemUsersChart";
import VehicleAvailabilityChart from "@/components/VehicleAvailabilityChart";
import UserActivityDistributionChart from "@/components/UserActivityDistributionChart";
import UserBehaviorAnomalyChart from "@/components/UserBehaviorAnomalyChart";

export default function HistoryPage() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'trends' | 'overview' | 'rankings'>('trends');

  const dayOptions = [
    { value: 7, label: "最近7天" },
    { value: 30, label: "最近30天" },
    { value: 90, label: "最近90天" },
    { value: 365, label: "最近365天" },
  ];

  // 获取数据概览
  const { data: dataOverview, isLoading: overviewLoading } =
    api.history.getDataOverview.useQuery();

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


          {/* 数据说明 */}
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-100 p-1">
                <ClockIcon className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-sm text-amber-800">
                <span className="font-medium">数据说明：</span>
                历史趋势数据截止昨天，不包含当天实时数据。每日凌晨00:05自动采集前一天的完整统计数据。
              </p>
            </div>
          </div>

          {/* 数据概览卡片 */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">系统用量累计</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {overviewLoading
                      ? "..."
                      : formatNumber(dataOverview?.totalSystemRequests || 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dataOverview?.systemStartDate
                      ? `自 ${dataOverview.systemStartDate} 开始统计`
                      : "所有历史数据汇总统计"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <TruckIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">系统用量峰值</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overviewLoading
                      ? "..."
                      : formatNumber(
                          dataOverview?.systemPeakUsage || 0,
                        )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    历史最高单日请求量
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">日活跃峰值</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overviewLoading
                      ? "..."
                      : formatNumber(
                          dataOverview?.dailyActiveUsersPeak || 0,
                        )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    历史最高单日活跃用户数
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">最新数据</p>
                  <p className="text-lg font-bold text-slate-800">
                    {overviewLoading
                      ? "..."
                      : dataOverview?.latestDates.user || "暂无"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab切换器 */}
          <div className="mb-6">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                    activeTab === 'trends'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  📈 趋势分析
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  📊 整体分析
                </button>
                <button
                  onClick={() => setActiveTab('rankings')}
                  className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                    activeTab === 'rankings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  🏆 各种榜单
                </button>
              </nav>
            </div>
          </div>

          {/* 时间范围选择器（仅在趋势分析tab显示） */}
          {activeTab === 'trends' && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  时间范围分析
                </h3>
                <p className="text-sm text-slate-600">选择时间范围查看历史数据趋势</p>
              </div>
              <div className="flex gap-2">
                {dayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDays(option.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedDays === option.value
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 整体分析说明（仅在整体分析tab显示） */}
          {activeTab === 'overview' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                整体数据分析
              </h3>
              <p className="text-sm text-slate-600">基于固定时间范围的整体数据分析和用户行为模式</p>
            </div>
          )}

          {/* 榜单说明（仅在榜单tab显示） */}
          {activeTab === 'rankings' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                各种榜单
              </h3>
              <p className="text-sm text-slate-600">展示各类数据排行榜和统计榜单</p>
            </div>
          )}

          {/* 趋势图表区域（仅在趋势分析tab显示） */}
          {activeTab === 'trends' && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* 系统总用量趋势图表 */}
                <SystemUsageChart days={selectedDays} />

                {/* 系统峰值趋势图表 */}
                <SystemPeakChart days={selectedDays} />

                {/* 系统活跃用户趋势图表 */}
                <SystemUsersChart days={selectedDays} />

                {/* 车辆可用性趋势图表 */}
                <VehicleAvailabilityChart days={selectedDays} />

                {/* 个人用量趋势图表 */}
                <PersonalUsageChart days={selectedDays} />

                {/* 用户活跃度分布图表 */}
                <UserActivityDistributionChart />
              </div>


            </>
          )}

          {/* 整体分析图表区域（仅在整体分析tab显示） */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* 用户行为变化检测图表 */}
              <UserBehaviorAnomalyChart days={14} />
            </div>
          )}

          {/* 榜单区域（仅在榜单tab显示） */}
          {activeTab === 'rankings' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* 单日请求量排行榜 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">🏆 单日请求量排行榜</h3>
                  <p className="text-sm text-slate-600">
                    历史单日请求量最高记录（Top 10）
                  </p>
                </div>
                <div className="text-center text-slate-500 py-8">
                  <p>榜单功能开发中...</p>
                  <p className="text-xs mt-2">即将展示单日请求量历史最高记录</p>
                </div>
              </div>

              {/* 用户活跃度排行榜 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">👑 用户活跃度排行榜</h3>
                  <p className="text-sm text-slate-600">
                    最活跃用户排行（基于总请求量）
                  </p>
                </div>
                <div className="text-center text-slate-500 py-8">
                  <p>榜单功能开发中...</p>
                  <p className="text-xs mt-2">即将展示最活跃用户排行</p>
                </div>
              </div>

              {/* 车辆存活率排行榜 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">🚗 车辆存活率排行榜</h3>
                  <p className="text-sm text-slate-600">
                    历史车辆存活率最高记录
                  </p>
                </div>
                <div className="text-center text-slate-500 py-8">
                  <p>榜单功能开发中...</p>
                  <p className="text-xs mt-2">即将展示车辆存活率历史记录</p>
                </div>
              </div>

              {/* 系统峰值记录榜 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">📈 系统峰值记录榜</h3>
                  <p className="text-sm text-slate-600">
                    系统各项指标的历史峰值记录
                  </p>
                </div>
                <div className="text-center text-slate-500 py-8">
                  <p>榜单功能开发中...</p>
                  <p className="text-xs mt-2">即将展示系统各项峰值记录</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
