/**
 * OpenNext Cloudflare 配置文件
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 基础配置 - 不使用缓存
export default defineCloudflareConfig({
  // 可选：启用 R2 增量缓存
  // incrementalCache: r2IncrementalCache,

  // 可选：启用 KV 增量缓存
  // incrementalCache: kvIncrementalCache,

  // 启用缓存拦截（推荐）
  enableCacheInterception: true,
});
