import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function HourlyStats() {
  const hourlyData = [
    { hour: "00:00", users: 1234, vehicles: 45, activity: "低" },
    { hour: "01:00", users: 987, vehicles: 32, activity: "低" },
    { hour: "02:00", users: 756, vehicles: 28, activity: "低" },
    { hour: "03:00", users: 543, vehicles: 21, activity: "低" },
    { hour: "04:00", users: 432, vehicles: 18, activity: "低" },
    { hour: "05:00", users: 654, vehicles: 25, activity: "低" },
    { hour: "06:00", users: 1876, vehicles: 67, activity: "中" },
    { hour: "07:00", users: 3421, vehicles: 123, activity: "高" },
    { hour: "08:00", users: 4567, vehicles: 156, activity: "高" },
    { hour: "09:00", users: 5234, vehicles: 189, activity: "高" },
    { hour: "10:00", users: 4876, vehicles: 167, activity: "高" },
    { hour: "11:00", users: 4321, vehicles: 145, activity: "中" },
  ];

  return (
    <>
      <Head>
        <title>按小时统计 | Augment Proxy Deck</title>
        <meta name="description" content="查看按小时维度的各项数据统计" />
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
                <ClockIcon className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-slate-800">按小时统计</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">峰值时段</p>
                  <p className="text-3xl font-bold text-slate-800">09:00</p>
                  <p className="text-sm text-slate-500">用户活跃度最高</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">低谷时段</p>
                  <p className="text-3xl font-bold text-slate-800">04:00</p>
                  <p className="text-sm text-slate-500">用户活跃度最低</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">平均活跃度</p>
                  <p className="text-3xl font-bold text-slate-800">2,847</p>
                  <p className="text-sm text-slate-500">每小时用户数</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">24小时数据详情</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      用户数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      车辆检测
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      活跃度
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {hourlyData.map((data, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {data.hour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {data.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {data.vehicles}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          data.activity === "高" 
                            ? "bg-red-100 text-red-800"
                            : data.activity === "中"
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {data.activity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">24小时用户活跃度曲线</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">图表区域 - 待接入数据</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">车辆检测时段分布</h3>
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
