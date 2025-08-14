import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, TruckIcon, ExclamationTriangleIcon, ArrowUpIcon, ChevronUpIcon, ChevronDownIcon, UserGroupIcon, ClockIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { formatNumber, formatDateTime } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";
import { useState, useEffect, useRef } from "react";

export default function VehicleStats() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof CarStats | null>('count24Hour');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: carStats, isLoading, error, isFetching } = api.stats.getCarStats.useQuery(
    undefined,
    {
      // 启用轮询，每30秒更新一次数据
      refetchInterval: POLLING_INTERVALS.VEHICLE_STATS,
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

  // 排序功能
  const handleSort = (field: keyof CarStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 过滤和排序车辆数据
  const filteredAndSortedCars = carStats?.cars
    .filter(car => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return car.carId.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc'
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }

      return 0;
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

  // 可排序表头组件
  const SortableHeader = ({ field, children }: { field: keyof CarStats; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ?
            <ChevronUpIcon className="h-3 w-3" /> :
            <ChevronDownIcon className="h-3 w-3" />
        )}
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
                <TruckIcon className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-slate-800">黑车统计</h1>
                {isFetching && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
          {carStats && (
            <>
              {/* Update Time Info */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-500">
                    数据更新时间: {formatDateTime(carStats.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>每30秒自动更新</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 车辆统计 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">车辆统计</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(carStats.summary.activeCars)}/{formatNumber(carStats.summary.totalCars)}</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TruckIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      存活率: {((carStats.summary.activeCars / carStats.summary.totalCars) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 总乘客数 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">总乘客数</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(carStats.summary.totalUsers)}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每车: {(carStats.summary.totalUsers / carStats.summary.totalCars).toFixed(1)}人
                    </span>
                  </div>
                </div>

                {/* 1小时请求数 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">1小时请求数</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(carStats.summary.totalCount1Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每人: {(carStats.summary.totalCount1Hour / carStats.summary.totalUsers).toFixed(1)}个请求
                    </span>
                  </div>
                </div>

                {/* 24小时请求数 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">24小时请求数</p>
                      <p className="text-3xl font-bold text-slate-800">{formatNumber(carStats.summary.totalCount24Hour)}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500">
                      平均每人: {(carStats.summary.totalCount24Hour / carStats.summary.totalUsers).toFixed(1)}个请求
                    </span>
                  </div>
                </div>
          </div>

              {/* All Cars Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
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
                        <label htmlFor="search" className="text-sm text-slate-600">搜索:</label>
                        <input
                          ref={searchInputRef}
                          id="search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="车辆ID..."
                          className="border border-slate-300 rounded px-3 py-1 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    💡 使用搜索功能快速查找特定车辆，支持车辆ID搜索 | 快捷键: Ctrl+F (Mac: Cmd+F)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <SortableHeader field="carId">车辆信息</SortableHeader>
                        <SortableHeader field="currentUsers">乘客数/席位数</SortableHeader>
                        <SortableHeader field="count1Hour">1小时请求</SortableHeader>
                        <SortableHeader field="count24Hour">24小时请求</SortableHeader>
                        <SortableHeader field="isActive">状态</SortableHeader>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredAndSortedCars.length > 0 ? (
                        filteredAndSortedCars.map((car, index) => (
                          <tr key={car.carId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900 font-mono">
                                {highlightText(car.carId, searchQuery)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div className="flex flex-col">
                                <span className="font-semibold text-lg">{car.currentUsers}/{car.maxUsers}</span>
                                <span className="text-xs text-slate-500">
                                  上座率: {((car.currentUsers / car.maxUsers) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className="font-semibold">{car.count1Hour}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className="font-semibold">{car.count24Hour}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                car.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {car.isActive ? '智驾' : '车祸'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            {searchQuery ? `没有找到包含 "${searchQuery}" 的车辆` : '暂无数据'}
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
            className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-30"
            aria-label="回到顶部"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}
      </main>
    </>
  );
}
