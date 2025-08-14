import Link from "next/link";
import {
  UserGroupIcon,
  TruckIcon,
  ClockIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { api } from "@/utils/api";
import { formatDateTime, formatNumber } from "@/utils/formatters";
import { POLLING_INTERVALS, QUERY_CONFIG } from "@/utils/config";

export default function Home() {
  const { data: userStatsSummary, isFetching } = api.stats.getUserStatsSummary.useQuery(
    undefined,
    {
      // 启用轮询，每60秒更新一次数据（首页更新频率可以稍低）
      refetchInterval: POLLING_INTERVALS.HOME_SUMMARY,
      ...QUERY_CONFIG,
    }
  );

  const { data: carStatsSummary } = api.stats.getCarStatsSummary.useQuery(
    undefined,
    {
      // 启用轮询，每60秒更新一次数据
      refetchInterval: POLLING_INTERVALS.HOME_SUMMARY,
      ...QUERY_CONFIG,
    }
  );

  const { data: hourlyStatsSummary } = api.stats.getHourlyStatsSummary.useQuery(
    undefined,
    {
      // 启用轮询，每60秒更新一次数据
      refetchInterval: POLLING_INTERVALS.HOME_SUMMARY,
      ...QUERY_CONFIG,
    }
  );
  const dataModules = [
    {
      title: "用户统计",
      description: userStatsSummary
        ? (
            <>
              1h活跃: {formatNumber(userStatsSummary.summary.totalUsers1Hour)} | 1h请求: {formatNumber(userStatsSummary.summary.totalCount1Hour)}
              <br />
              24h活跃: {formatNumber(userStatsSummary.summary.totalUsers24Hour)} | 24h请求: {formatNumber(userStatsSummary.summary.totalCount24Hour)}
            </>
          )
        : "查看用户注册、活跃度等相关统计数据",
      icon: UserGroupIcon,
      href: "/stats/users",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      title: "黑车统计",
      description: carStatsSummary
        ? (
            <>
              车辆总数: {formatNumber(carStatsSummary.summary.totalCars)} | 活跃: {formatNumber(carStatsSummary.summary.activeCars)}
              <br />
              24h请求: {formatNumber(carStatsSummary.summary.totalCount24Hour)} | 用户: {formatNumber(carStatsSummary.summary.totalUsers)}
            </>
          )
        : "监控和分析黑车相关数据统计",
      icon: TruckIcon,
      href: "/stats/vehicles",
      color: "from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700"
    },
    {
      title: "按小时统计",
      description: hourlyStatsSummary
        ? (
            <>
              今日请求: {formatNumber(hourlyStatsSummary.summary.todayTotal)} | 用户: {formatNumber(hourlyStatsSummary.summary.todayUsers)}
              <br />
              昨日请求: {formatNumber(hourlyStatsSummary.summary.yesterdayTotal)} | 用户: {formatNumber(hourlyStatsSummary.summary.yesterdayUsers)}
            </>
          )
        : "查看按小时维度的各项数据统计",
      icon: ClockIcon,
      href: "/stats/hourly",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    }
  ];

  return (
    <Layout
      title="数据展示平台 | Augment Proxy Deck"
      description="数据展示和统计分析平台"
      pageTitle="Augment Proxy Deck"
      pageIcon={ChartBarIcon}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-800 mb-4">
          数据统计中心
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          选择下方数据模块，查看详细的统计信息和分析报告
        </p>
      </div>

      {/* Data Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {dataModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${module.color} ${module.hoverColor} p-8 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
            >
              <div className="relative z-10">
                <div className="mb-6">
                  <IconComponent className="h-12 w-12 text-white/90" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{module.title}</h3>
                <div className="text-white/90 leading-relaxed text-sm">
                  {module.description}
                </div>
              </div>

              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5 transition-transform duration-300 group-hover:scale-110" />
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-600">系统运行正常</span>
        </div>
        {userStatsSummary && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-xs text-slate-500">
              数据更新时间: {formatDateTime(userStatsSummary.updatedAt)}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>每60秒自动更新</span>
            </div>
            {isFetching && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>更新中...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
