/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add remote hosts here if you load screenshots from a CDN.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
