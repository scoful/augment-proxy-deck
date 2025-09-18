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
   * 浏览器兼容性配置
   * 支持更广泛的浏览器，包括旧版本和移动端
   */
  compiler: {
    // 移除console.log在生产环境
    removeConsole: process.env.NODE_ENV === "production",
  },

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
      cfg.resolve.alias["@/server/api/trpc"] = path.resolve(
        process.cwd(),
        "src/server/api/trpc-vercel.ts",
      );
    }
    return cfg;
  },
};

export default config;
