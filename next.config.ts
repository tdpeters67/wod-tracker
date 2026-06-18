import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a parent dir also has a lockfile).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
