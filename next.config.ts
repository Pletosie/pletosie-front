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
};

export default nextConfig;
