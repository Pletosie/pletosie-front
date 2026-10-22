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
     return [{
       source: '/api/v1/:path*',
       destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
     }];
   },
};

export default nextConfig;
