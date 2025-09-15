import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// export API handler
const handler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});

export default function trpcHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  return handler(req, res) as Promise<void>;
}

// 显式导出配置以满足 Next.js 15 类型检查
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
