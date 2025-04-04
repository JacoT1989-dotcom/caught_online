// lib/reviews/config.ts
/**
 * Configuration for Stamped.io reviews integration
 * Based on official Stamped.io API documentation
 */
export const STAMPED_CONFIG = {
  // API Keys
  publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY,
  privateKey: process.env.STAMPED_PRIVATE_KEY,
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH,
  
  // Store configuration
  storeUrl: process.env.NEXT_PUBLIC_STORE_URL || 'https://caught-online.myshopify.com',
  
  // Authentication for API calls
  authEmail: process.env.STAMPED_AUTH_EMAIL || 'your-admin-email@example.com',
  
  // Default review settings
  defaultPageSize: 10,
  
  // Debugging
  enableLogging: true,
  
  // Local storage fallback
  useLocalFallback: true
} as const;