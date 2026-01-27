import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Builder.io to embed this site in an iframe for visual editing
  // Allow GTM and related scripts to load
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'self' https://*.builder.io https://builder.io",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://cdn.builder.io https://*.builder.io",
              "connect-src 'self' https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.builder.io https://*.cloudfunctions.net https://sgtm.accesshire.net https://composable-lg.ts.r.appspot.com https://*.netlify.app",
              "img-src 'self' data: https: blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
