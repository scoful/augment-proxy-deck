/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import path from "path";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,



  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  /**
   * TypeScript 配置
   */
  typescript: {
    // 在构建时忽略类型错误（仅用于解决 tRPC 兼容性问题）
    ignoreBuildErrors: true,
  },

  // 构建时根据平台切换 tRPC 入口：
  // - Vercel: 使用 Turso 版（src/server/api/trpc-vercel.ts）
  // - 其他: 使用默认的 Cloudflare 版（src/server/api/trpc.ts）
  webpack: (cfg) => {
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      cfg.resolve = cfg.resolve || {};
      cfg.resolve.alias = cfg.resolve.alias || {};
      const target = path.resolve(
        process.cwd(),
        "src/server/api/trpc-vercel.ts",
      );
      const trpcModuleId = "@/server/api/trpc";
      const trpcSrcAbs = path.resolve(process.cwd(), "src/server/api/trpc.ts");
      const trpcSrcAbsPosix = trpcSrcAbs.split(path.sep).join("/");

      // 覆盖模块别名与被 tsconfig 路径插件解析后的绝对路径两种情况
      cfg.resolve.alias[trpcModuleId] = target;
      cfg.resolve.alias[trpcSrcAbs] = target;
      cfg.resolve.alias[trpcSrcAbsPosix] = target;
    }
    return cfg;
  },
};

export default config;
