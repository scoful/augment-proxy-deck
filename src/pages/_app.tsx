import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { api } from "@/utils/api";

import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={geist.className}>
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
};

export default api.withTRPC(MyApp);
