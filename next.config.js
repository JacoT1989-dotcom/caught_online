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
  env: {
    SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
  // Don't use output: 'export' for the hybrid approach

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
