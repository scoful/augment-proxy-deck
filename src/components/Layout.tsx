import Head from "next/head";
import Link from "next/link";
import { ArrowLeftIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  pageTitle: string;
  pageIcon: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
}

export default function Layout({ 
  children, 
  title, 
  description, 
  pageTitle, 
  pageIcon: PageIcon,
  showBackButton = false 
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Link 
                  href="/"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>返回首页</span>
                </Link>
              )}
              <div className="flex items-center gap-3">
                {showBackButton ? (
                  <PageIcon className="h-8 w-8 text-blue-600" />
                ) : (
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                )}
                <h1 className="text-2xl font-bold text-slate-800">
                  {pageTitle}
                </h1>
                {!showBackButton && (
                  <span className="text-sm text-slate-500 ml-2">数据展示平台</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {children}
        </div>
      </main>
    </>
  );
}
