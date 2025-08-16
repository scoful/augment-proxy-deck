/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * 浏览器兼容性配置
   * 支持更广泛的浏览器，包括旧版本和移动端
   */
  swcMinify: true,
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
};

export default config;
