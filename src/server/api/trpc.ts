/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { getDatabase as getCloudflareDatabase } from "@/db/cloudflare";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = Record<string, never>;

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */

// 环境检测
function detectEnvironment() {
  const isCloudflare = typeof globalThis.caches !== "undefined";
  const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
  return { isCloudflare, isVercel };
}

// 预热 Vercel 环境的数据库
const env = detectEnvironment();
if (env.isVercel) {
  // 使用 Vercel 专用数据库模块
  void import("@/db/vercel").then(({ warmupDatabases }) => {
    warmupDatabases().catch((error) => {
      console.error("❌ Vercel database warmup failed:", error);
    });
  });
}

const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  const env = detectEnvironment();

  if (env.isVercel) {
    // Vercel 环境：抛出错误，提示使用正确的数据库模块
    throw new Error(
      "Vercel environment detected. This build should use the Vercel-specific database configuration.",
    );
  }

  // Cloudflare 或本地环境：使用 Cloudflare 专用数据库模块
  // 尝试获取 Cloudflare Workers 环境中的 D1 数据库实例
  let d1Database;
  try {
    // 在 Cloudflare Workers 环境中获取 D1 绑定
    const cloudflareContext = getCloudflareContext();
    d1Database = cloudflareContext.env?.DB;
  } catch {
    // 在本地开发环境中，getCloudflareContext 会失败，使用默认的本地数据库
    d1Database = undefined;
  }

  return {
    db: getCloudflareDatabase(d1Database),
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({});
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);
