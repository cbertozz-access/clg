import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Builder.io to embed this site in an iframe for visual editing
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.builder.io https://builder.io",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
