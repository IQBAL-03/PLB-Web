import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.100.13",
    "192.168.100.*",
    "192.168.*",
    "localhost",
    "127.0.0.1",
  ],
  experimental: {
    cpus: 2,
  },
  reactCompiler: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
