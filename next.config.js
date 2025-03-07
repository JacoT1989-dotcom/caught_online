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

  // Add environment variable loading
  env: {
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT,
  },
};

module.exports = nextConfig;