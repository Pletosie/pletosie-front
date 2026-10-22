import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.PLETOSIE_BUILD_DIR || ".next",
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backend = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
    return [{ source: "/api/v1/:path*", destination: backend + "/:path*" }];
  },
};
export default nextConfig;
