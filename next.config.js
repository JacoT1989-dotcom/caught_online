/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "cdn.shopify.com",
      "via.placeholder.com",
      "stamped.io",
      "xbutpndzgqpjnjst.public.blob.vercel-storage.com",
      "images.unsplash.com",
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
