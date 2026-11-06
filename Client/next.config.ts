import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Extra image hosts (comma separated) that next/image may optimize, e.g. your
 * S3/CloudFront media domain: NEXT_PUBLIC_IMAGE_HOSTS=dxxxx.cloudfront.net
 * Images from any other https host still display - they are just served
 * unoptimized (see components/shared/SmartImage.tsx).
 */
const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

/**
 * Content Security Policy (production only - the dev server needs eval and
 * websockets). Next.js and Ant Design inject inline scripts/styles, so
 * 'unsafe-inline' is required without a nonce setup; the remaining
 * directives still block plugins, foreign <base> tags, form hijacking and
 * framing of this site by other origins.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  // https: is needed for direct-to-S3 uploads from the admin media library
  "connect-src 'self' https:",
  // Video players and admin-approved demo embeds
  "frame-src https:",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProduction
    ? [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      ...extraImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
    ],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Screenshots and brand assets never change in place - cache them.
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  /**
   * Routes from the previous product (Easy Bangla Patente) still exist on
   * disk until the legacy folders are moved out (see ../_legacy/README.md).
   * These redirects make sure visitors and crawlers never land on them.
   */
  async redirects() {
    return [
      { source: "/login", destination: "/admin/login", permanent: false },
      { source: "/register", destination: "/", permanent: false },
      { source: "/dashboard", destination: "/admin", permanent: false },
      { source: "/dashboard/:path*", destination: "/admin", permanent: false },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/blogs", destination: "/", permanent: false },
      { source: "/blogs/:path*", destination: "/", permanent: false },
      { source: "/App/:path*", destination: "/work", permanent: false },
      { source: "/feedback", destination: "/", permanent: false },
      { source: "/propile/:path*", destination: "/", permanent: false },
      { source: "/YTFreevideo", destination: "/", permanent: false },
      // Industry pages live at /demos/<slug>; /industries/<slug> is an alias
      {
        source: "/industries/:slug",
        destination: "/demos/:slug",
        permanent: true,
      },
    ];
  },
};

// Check if Sentry is enabled (has DSN) to avoid unnecessary source map uploads
// Since Sentry is currently disabled (dsn: undefined), skip the wrapper to save build time
// This prevents the ~4 minute delay in runAfterProductionCompile from source map uploads
const isSentryEnabled =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// If Sentry is disabled, export config directly without wrapper to skip source map uploads
// Only apply Sentry config when actually enabled
const config = isSentryEnabled
  ? withSentryConfig(nextConfig, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "sh-org-cx",

      project: "javascript-nextjs",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
          // Automatically tree-shake Sentry logger statements to reduce bundle size
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;

export default config;
