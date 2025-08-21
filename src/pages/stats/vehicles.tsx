import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TruckIcon,
  ArrowUpIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber, formatDateTime } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";
import { type CarStats } from "@/server/api/routers/stats";
import { useState, useEffect, useRef } from "react";

export default function VehicleStats() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof CarStats | null>(
    "count24Hour",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: carStats,
    isLoading,
    error,
    isFetching,
  } = api.stats.getCarStats.useQuery(undefined, {
    // 启用轮询，每60秒更新一次数据
    refetchInterval: POLLING_INTERVALS.VEHICLE_STATS,
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
  const handleSort = (field: keyof CarStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 过滤和排序车辆数据
  const filteredAndSortedCars =
    carStats?.cars
      .filter((car) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return car.carId.toLowerCase().includes(query);
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

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortDirection === "asc"
            ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
            : (bValue ? 1 : 0) - (aValue ? 1 : 0);
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
    field: keyof CarStats;
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
        <title>黑车统计 | Augment Proxy Deck</title>
        <meta name="description" content="监控和分析黑车相关数据统计" />
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
                <TruckIcon className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-slate-800">黑车统计</h1>
                {isFetching && (
                  <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-xs text-red-600">更新中...</span>
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
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
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
          {carStats && (
            <>
              {/* Update Time Info */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-500">
                    数据更新时间: {formatDateTime(carStats.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span>每60秒自动更新</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 车辆统计 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">车辆统计</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(carStats.summary.activeCars)}/
                        {formatNumber(carStats.summary.totalCars)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                      <TruckIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      存活率:{" "}
                      {carStats.summary.totalCars === 0
                        ? "0%"
                        : (
                            (carStats.summary.activeCars /
                              carStats.summary.totalCars) *
                            100
                          ).toFixed(1) + "%"}
                    </span>
                  </div>
                </div>

                {/* 总设备数 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">总设备数</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(carStats.summary.totalUsers)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每车负载:{" "}
                      {carStats.summary.totalCars === 0
                        ? "0 台设备"
                        : (
                            carStats.summary.totalUsers /
                            carStats.summary.totalCars
                          ).toFixed(1) + " 台设备"}
                    </span>
                  </div>
                </div>

                {/* 1小时请求数 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时请求数</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(carStats.summary.totalCount1Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <ClockIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每设备:{" "}
                      {carStats.summary.totalUsers === 0
                        ? "0 个请求"
                        : (
                            carStats.summary.totalCount1Hour /
                            carStats.summary.totalUsers
                          ).toFixed(1) + " 个请求"}
                    </span>
                  </div>
                </div>

                {/* 24小时请求数 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时请求数</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {formatNumber(carStats.summary.totalCount24Hour)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每设备:{" "}
                      {carStats.summary.totalUsers === 0
                        ? "0 个请求"
                        : (
                            carStats.summary.totalCount24Hour /
                            carStats.summary.totalUsers
                          ).toFixed(1) + " 个请求"}
                    </span>
                  </div>
                </div>
              </div>

              {/* All Cars Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      所有车辆详情
                      {searchQuery && (
                        <span className="ml-2 text-sm text-slate-500">
                          (找到 {filteredAndSortedCars.length} 个结果)
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
                          placeholder="车辆ID..."
                          className="w-64 rounded border border-slate-300 px-3 py-1 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    💡 使用搜索功能快速查找特定车辆，支持车辆ID搜索 | 快捷键:
                    Ctrl+F (Mac: Cmd+F)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <SortableHeader field="carId">车辆信息</SortableHeader>
                        <SortableHeader field="currentUsers">
                          设备数/席位数
                        </SortableHeader>
                        <SortableHeader field="count1Hour">
                          1小时请求
                        </SortableHeader>
                        <SortableHeader field="count24Hour">
                          24小时请求
                        </SortableHeader>
                        <SortableHeader field="isActive">状态</SortableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredAndSortedCars.length > 0 ? (
                        filteredAndSortedCars.map((car) => (
                          <tr key={car.carId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-mono text-sm font-medium text-slate-900">
                                {highlightText(car.carId, searchQuery)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                              <div className="flex flex-col">
                                <span className="text-lg font-semibold">
                                  {car.currentUsers}/{car.maxUsers}
                                </span>
                                <span className="text-xs text-slate-500">
                                  上座率:{" "}
                                  {car.maxUsers === 0
                                    ? "0%"
                                    : (
                                        (car.currentUsers / car.maxUsers) *
                                        100
                                      ).toFixed(0) + "%"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                              <span className="font-semibold">
                                {car.count1Hour}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                              <span className="font-semibold">
                                {car.count24Hour}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  car.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {car.isActive ? "智驾" : "车祸"}
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
                              ? `没有找到包含 "${searchQuery}" 的车辆`
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
            className="fixed right-8 bottom-8 z-30 rounded-full bg-red-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-red-700"
            aria-label="回到顶部"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}
      </main>
    </>
  );
}
