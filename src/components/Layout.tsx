import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";
import { APP_CONFIG } from "@/config/version.js";

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
  showBackButton = false,
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
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Link
                  href="/"
                  className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-800"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>返回首页</span>
                </Link>
              )}
              <div className="flex items-center gap-3">
                {showBackButton ? (
                  <PageIcon className="h-8 w-8 text-blue-600" />
                ) : (
                  <Image
                    src="/favicon.ico"
                    alt="Augment Proxy Deck"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                )}
                <h1 className="text-2xl font-bold text-slate-800">
                  {pageTitle}
                </h1>
                {!showBackButton && (
                  <div className="ml-2 flex items-center gap-2">
                    <span className="text-sm text-slate-500">数据展示平台</span>
                    <span className="text-xs text-slate-400">
                      {APP_CONFIG.version}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">{children}</div>
      </main>
    </>
  );
}
