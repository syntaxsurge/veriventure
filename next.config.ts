import path from "path";
import type { NextConfig } from "next";

const threadStreamStub = path.resolve(__dirname, "src/lib/stubs/thread-stream.js");
const threadStreamAlias = "./src/lib/stubs/thread-stream.js";

const securityHeaders = [
  {
    key: "Referrer-Policy",
    value: "same-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["dkg.js"],
  output: "standalone",
  env: {
    DEMO_VIDEO_URL: process.env.DEMO_VIDEO_URL,
  },
  turbopack: {
    resolveAlias: {
      "thread-stream": threadStreamAlias,
    },
  },
  async redirects() {
    const demoVideo = process.env.DEMO_VIDEO_URL || "https://www.youtube.com/";
    const pitchDeck =
      process.env.PITCH_DECK_URL || "https://example.com/pitch-deck";

    return [
      {
        source: "/demo-video",
        destination: demoVideo,
        permanent: false,
      },
      {
        source: "/pitch-deck",
        destination: pitchDeck,
        permanent: false,
      },
    ];
  },
  // Webpack config for fallback (when --webpack flag is used)
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "thread-stream": threadStreamStub,
    };

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules\/thread-stream\/test/,
      use: "null-loader",
    });

    // Handle pino and dependencies that include test files
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "thread-stream/test": "thread-stream/test",
        "why-is-node-running": "why-is-node-running",
      });
    }

    return config;
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
