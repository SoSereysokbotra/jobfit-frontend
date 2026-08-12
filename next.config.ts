import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

/**
 * Service worker is disabled in dev on purpose: a live SW caching a Next dev
 * build fights HMR and serves stale chunks, which reads as "my change didn't
 * apply". Test offline behaviour against `npm run build && npm run start`.
 */
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // The offline shell must be in the precache or it cannot be served offline.
  additionalPrecacheEntries: [{ url: "/offline", revision: null }],
});

export default withSerwist(nextConfig);
