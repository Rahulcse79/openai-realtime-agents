import type { NextConfig } from "next";

const ALLOW_ALL_DEV_ORIGINS = process.env.NEXT_PUBLIC_ALLOW_ALL_DEV_ORIGINS === 'true';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  allowedDevOrigins: ALLOW_ALL_DEV_ORIGINS
    ? ['*']
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.6.182:3000',
        'http://192.168.*.*:3000',
        'http://10.*.*.*:3000',
        'http://172.16.*.*:3000',
        'http://172.17.*.*:3000',
        'http://172.18.*.*:3000',
        'http://172.19.*.*:3000',
        'http://172.2*.*.*:3000',
        'http://172.30.*.*:3000',
        'http://172.31.*.*:3000',
  ],
};

export default nextConfig;
