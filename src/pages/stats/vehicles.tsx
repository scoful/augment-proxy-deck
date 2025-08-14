import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, TruckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function VehicleStats() {
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">检测总数</p>
                  <p className="text-3xl font-bold text-slate-800">5,678</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-red-600">+23.1%</span>
                <span className="text-sm text-slate-500 ml-1">较上月</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">确认黑车</p>
                  <p className="text-3xl font-bold text-slate-800">1,234</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-red-600">+18.7%</span>
                <span className="text-sm text-slate-500 ml-1">较上月</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">处理率</p>
                  <p className="text-3xl font-bold text-slate-800">89.2%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">+5.4%</span>
                <span className="text-sm text-slate-500 ml-1">较上月</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">平均响应时间</p>
                  <p className="text-3xl font-bold text-slate-800">12.5</p>
                  <p className="text-xs text-slate-500">分钟</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">-8.3%</span>
                <span className="text-sm text-slate-500 ml-1">较上月</span>
              </div>
            </div>
          </div>

          {/* Alert Section */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">高风险区域警报</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-slate-800">朝阳区</p>
                <p className="text-sm text-slate-600">检测到 45 起疑似黑车活动</p>
                <p className="text-xs text-red-600 mt-1">风险等级: 高</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-slate-800">海淀区</p>
                <p className="text-sm text-slate-600">检测到 32 起疑似黑车活动</p>
                <p className="text-xs text-orange-600 mt-1">风险等级: 中</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-slate-800">西城区</p>
                <p className="text-sm text-slate-600">检测到 18 起疑似黑车活动</p>
                <p className="text-xs text-yellow-600 mt-1">风险等级: 低</p>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">黑车检测趋势</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">图表区域 - 待接入数据</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">区域分布热力图</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">图表区域 - 待接入数据</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
