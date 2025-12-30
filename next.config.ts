import type { NextConfig } from "next";

const allowAllDevOrigins =
  process.env.NEXT_PUBLIC_ALLOW_ALL_DEV_ORIGINS === "true";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,

  ...(isDev && {
    allowedDevOrigins: allowAllDevOrigins
      ? ["*"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  }),
};

export default nextConfig;
