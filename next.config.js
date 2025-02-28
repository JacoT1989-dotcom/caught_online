/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "cdn.shopify.com",
      "via.placeholder.com",
      "stamped.io",
      "xbutpndzgqpjnjst.public.blob.vercel-storage.com",
      "images.unsplash.com", // Added from your error logs
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: true, // Required for static exports
  },
  env: {
    SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
  // This addresses the dynamic API route issues during static export
  // You can enable this if you want to build a fully static site
  // output: 'export',

  // This helps deal with pages that cause export problems
  experimental: {
    // This makes Next.js more forgiving with pages that have
    // data fetching issues during static generation
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
