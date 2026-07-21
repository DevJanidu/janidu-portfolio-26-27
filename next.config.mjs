/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // No remote images are currently loaded via next/image — every asset
    // ships from /public. Left empty (rather than a wildcard) so any
    // future remote host has to be added explicitly.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Collapse the non-www host (http or https) onto the canonical
      // https://www.janidudev.com — matches once, so it can't loop.
      {
        source: "/:path*",
        has: [{ type: "host", value: "janidudev.com" }],
        destination: "https://www.janidudev.com/:path*",
        permanent: true,
      },
      // Belt-and-suspenders http->https upgrade for hosts that proxy
      // plain HTTP through to the app (most platforms already do this at
      // the edge, but this keeps it correct regardless of host).
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://www.janidudev.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
