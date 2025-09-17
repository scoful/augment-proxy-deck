import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowLeftIcon,
  PlayIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber } from "@/utils/formatters";
import PersonalUsageChart from "@/components/PersonalUsageChart";
import SystemUsageChart from "@/components/SystemUsageChart";
import SystemUsersChart from "@/components/SystemUsersChart";
import VehicleAvailabilityChart from "@/components/VehicleAvailabilityChart";

export default function HistoryPage() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [triggerStatus, setTriggerStatus] = useState<{
    daily: "idle" | "loading" | "success" | "error";
  }>({
    daily: "idle",
  });

  // 获取数据概览
  const {
    data: dataOverview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = api.history.getDataOverview.useQuery();

  // 手动触发数据采集的 mutation
  const triggerCollection = api.history.triggerDataCollection.useMutation({
    onSuccess: (data, variables) => {
      setTriggerStatus((prev) => ({
        ...prev,
        daily: "success",
      }));
      // 刷新数据概览
      void refetchOverview();
      // 3秒后重置状态
      setTimeout(() => {
        setTriggerStatus((prev) => ({
          ...prev,
          daily: "idle",
        }));
      }, 3000);
    },
    onError: (error, variables) => {
      setTriggerStatus((prev) => ({
        ...prev,
        daily: "error",
      }));
      console.error("数据采集失败:", error);
      // 5秒后重置状态
      setTimeout(() => {
        setTriggerStatus((prev) => ({
          ...prev,
          daily: "idle",
        }));
      }, 5000);
    },
  });

  // 触发每日数据采集
  const handleTriggerDaily = () => {
    setTriggerStatus((prev) => ({ ...prev, daily: "loading" }));
    triggerCollection.mutate({ type: "daily" });
  };

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
              <h2 className="text-2xl font-bold text-slate-800">
                数据趋势分析
              </h2>
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
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 数据概览卡片 */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">用户记录</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {overviewLoading
                      ? "..."
                      : formatNumber(
                          dataOverview?.recordCounts.userDetail || 0,
                        )}
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
                  <p className="text-sm text-slate-600">车辆记录</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {overviewLoading
                      ? "..."
                      : formatNumber(
                          dataOverview?.recordCounts.vehicleDetail || 0,
                        )}
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
                  <p className="text-sm text-slate-600">系统记录</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {overviewLoading
                      ? "..."
                      : formatNumber(
                          dataOverview?.recordCounts.systemDetail || 0,
                        )}
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

          {/* 手动触发数据采集区域 */}
          <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800">
                  手动触发数据采集 (测试功能)
                </h3>
                <p className="text-sm text-orange-600">
                  在生产环境中手动触发定时任务，用于测试数据采集功能是否正常
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* 每日数据采集按钮 */}
                <div className="rounded-lg border border-orange-200 bg-white p-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-slate-800">每日数据采集</h4>
                    <p className="text-sm text-slate-600">
                      采集用户统计、车辆汇总、车辆明细、系统统计数据
                      (模拟每日00:05执行)
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerDaily}
                    disabled={triggerStatus.daily === "loading"}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      triggerStatus.daily === "loading"
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : triggerStatus.daily === "success"
                          ? "border border-green-200 bg-green-100 text-green-700"
                          : triggerStatus.daily === "error"
                            ? "border border-red-200 bg-red-100 text-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {triggerStatus.daily === "loading" ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        执行中...
                      </>
                    ) : triggerStatus.daily === "success" ? (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        执行成功
                      </>
                    ) : triggerStatus.daily === "error" ? (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        执行失败
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4" />
                        触发每日采集
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 趋势图表区域 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 个人用量趋势图表 */}
            <PersonalUsageChart days={selectedDays} />

            {/* 车辆可用性趋势图表 */}
            <VehicleAvailabilityChart days={selectedDays} />

            {/* 系统总用量趋势图表 */}
            <SystemUsageChart days={selectedDays} />

            {/* 系统总用户数趋势图表 */}
            <SystemUsersChart days={selectedDays} />
          </div>
        </div>
      </main>
    </>
  );
}
