import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
  } as any,
};

export default nextConfig;
