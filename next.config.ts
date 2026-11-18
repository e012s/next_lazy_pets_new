import type { NextConfig } from "next";

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  /** Dev: avoid Strict Mode double `useEffect` (production does not do this). */
  reactStrictMode: false,
  /** Auth proxy and workspace routes require a Node server (`next start`). */
  cacheComponents: false,
  partialPrefetching: false,
  /** Phone / LAN dev: open http://<your-ip>:4317 — hostname must be allowed or JS never loads. */
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.*.*",
    "10.*.*.*",
    ...extraDevOrigins,
  ],
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

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
