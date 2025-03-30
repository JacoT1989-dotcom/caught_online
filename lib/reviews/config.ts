// lib/reviews/config.ts
/**
 * Configuration for Stamped.io reviews integration
 * Based on official Stamped.io API documentation
 */
export const STAMPED_CONFIG = {
  // API Keys
  publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY || 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
  privateKey: process.env.STAMPED_PRIVATE_KEY || 'key-aUG1IG2m2QaT15i125Y8AjHD3WKx7c',
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || '151250',
  
  // Store configuration
  storeUrl: process.env.NEXT_PUBLIC_STORE_URL || 'https://caught-online.myshopify.com',
  
  // Authentication for API calls
  authEmail: process.env.STAMPED_AUTH_EMAIL || 'gareth@caughtonline.co.za',
  
  // Default review settings
  defaultPageSize: 10,
  
  // Debugging
  enableLogging: true,
  
  // Local storage fallback
  useLocalFallback: true
} as const; 