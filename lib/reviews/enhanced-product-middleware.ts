// lib/reviews/enhanced-product-middleware.ts
import { STAMPED_CONFIG } from "./config";

/**
 * Enhanced Product ID Translation Middleware
 * 
 * This middleware helps bridge the gap between Shopify product IDs and Stamped.io product IDs.
 * It provides mapping and translation functions to match products across both systems,
 * with improved support for CSV imports and error handling.
 */

// Type definitions for product mapping
export interface ProductMapping {
  shopifyId: string;
  stampedId: string;
  title: string;
  handle: string;
}

// CSV Import Row Interface
export interface CSVImportRow {
  product_id: string;
  product_handle?: string;
  productTitle?: string;
  productUrl?: string;
  rating: string | number;
  title?: string;
  author: string;
  email?: string;
  body: string;
  created_at: string;
  published?: string;
  reply?: string;
  replied_at?: string;
  publishedReply?: string;
  tags?: string;
  location?: string;
  [key: string]: any; // Allow for additional fields
}

// Extended in-memory storage for mappings
// This allows us to keep track of mappings during the session
let inMemoryMappings: ProductMapping[] = [];

// Manual mapping table for product IDs
// You can expand this with your known product mappings
// Export the PRODUCT_MAPPINGS array to make it accessible from other modules
export const PRODUCT_MAPPINGS: ProductMapping[] = [
  // Example: 
  // Shopify ID -> Stamped ID
  { 
    shopifyId: '7954181881916',
    stampedId: '7954173952060', 
    title: 'Orange Namibian Crab | Wild-caught | 700g',
    handle: 'orange-namibian-crab-wild-caught-700g'
  },
  { 
    shopifyId: '7954182701116',
    stampedId: '22954', 
    title: 'Trout Ribbons | Oak Smoked | 500g Pack',
    handle: 'trout-ribbons-oak-smoked-500g'
  },
  { 
    shopifyId: '7954183061564',
    stampedId: '23152', 
    title: 'Norwegian Salmon Ribbons | Oak Smoked | 500g Pack',
    handle: 'norwegian-salmon-ribbons-oak-smoked-500g'
  },
  // Add more mappings as you discover them
];

// Initialize in-memory mappings from the default set
function initializeMappings() {
  if (inMemoryMappings.length === 0) {
    inMemoryMappings = [...PRODUCT_MAPPINGS];
    console.log(`[ProductMiddleware] Initialized ${inMemoryMappings.length} mappings`);
  }
}

/**
 * Gets a Stamped ID from a Shopify ID using various matching strategies
 * Returns multiple possible IDs to improve matching chances
 */
export function getStampedId(shopifyId: string, title?: string, handle?: string): string[] {
  initializeMappings();
  
  // Clean the Shopify ID (remove the gid:// prefix if present)
  const cleanShopifyId = cleanProductId(shopifyId);
  
  // Strategy 1: Direct mapping lookup from in-memory mappings
  const directMapping = inMemoryMappings.find(mapping => 
    cleanProductId(mapping.shopifyId) === cleanShopifyId
  );
  
  if (directMapping) {
    console.log(`[ProductMiddleware] Direct mapping found: ${cleanShopifyId} -> ${directMapping.stampedId}`);
    return [directMapping.stampedId];
  }
  
  // Strategy 2: Title matching with fuzzy search
  if (title) {
    const titleMatches = inMemoryMappings.filter(mapping => {
      // Try to match by ignoring common formatting and removing special characters
      const normalizedMappingTitle = normalizeString(mapping.title);
      const normalizedSearchTitle = normalizeString(title);
      
      return normalizedMappingTitle.includes(normalizedSearchTitle) ||
             normalizedSearchTitle.includes(normalizedMappingTitle);
    });
    
    if (titleMatches.length > 0) {
      console.log(`[ProductMiddleware] Title match found for "${title}": ${titleMatches.map(m => m.stampedId).join(', ')}`);
      return titleMatches.map(m => m.stampedId);
    }
  }
  
  // Strategy 3: Handle matching with fuzzy search
  if (handle) {
    const handleMatches = inMemoryMappings.filter(mapping => {
      // Try to match handles, ignoring dashes and common words
      const normalizedMappingHandle = normalizeHandle(mapping.handle);
      const normalizedSearchHandle = normalizeHandle(handle);
      
      return normalizedMappingHandle.includes(normalizedSearchHandle) ||
             normalizedSearchHandle.includes(normalizedMappingHandle);
    });
    
    if (handleMatches.length > 0) {
      console.log(`[ProductMiddleware] Handle match found for "${handle}": ${handleMatches.map(m => m.stampedId).join(', ')}`);
      return handleMatches.map(m => m.stampedId);
    }
  }
  
  // If no match is found, return the original ID
  console.log(`[ProductMiddleware] No mapping found for ${cleanShopifyId}, using original ID`);
  return [cleanShopifyId];
}

/**
 * Gets a Shopify ID from a Stamped ID
 */
export function getShopifyId(stampedId: string): string | null {
  initializeMappings();
  
  // Clean the Stamped ID
  const cleanStampedId = cleanProductId(stampedId);
  
  // Look for a mapping in in-memory mappings
  const mapping = inMemoryMappings.find(mapping => 
    cleanProductId(mapping.stampedId) === cleanStampedId
  );
  
  if (mapping) {
    console.log(`[ProductMiddleware] Reverse mapping found: ${cleanStampedId} -> ${mapping.shopifyId}`);
    return mapping.shopifyId;
  }
  
  console.log(`[ProductMiddleware] No reverse mapping found for ${cleanStampedId}`);
  return null;
}

/**
 * Clean a product ID by removing prefixes and extracting numeric parts
 */
export function cleanProductId(productId: string): string {
  if (!productId) return '';
  
  // If it's a Shopify gid, extract just the numeric part
  if (productId.includes('gid://shopify/Product/')) {
    const idMatch = productId.match(/\/Product\/(\d+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
  }
  
  // If it contains slashes but isn't a gid format, take the last part
  if (productId.includes('/') && !productId.includes('gid://')) {
    const parts = productId.split('/');
    return parts[parts.length - 1];
  }
  
  return productId;
}

/**
 * Normalize a string for better matching
 * Removes special characters, makes lowercase, etc.
 */
function normalizeString(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Normalize a product handle for better matching
 */
function normalizeHandle(handle: string): string {
  if (!handle) return '';
  
  return handle
    .toLowerCase()
    .replace(/-/g, ' ')         // Replace dashes with spaces
    .replace(/oak smoked/g, '') // Remove common phrases
    .replace(/wild caught/g, '')
    .replace(/pack/g, '')
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Map a review to use Shopify product IDs
 */
export function mapReviewToShopify(review: any): any {
  if (!review) return review;
  
  // Skip if there's no product ID
  if (!review.productId) return review;
  
  // Try to find a Shopify ID
  const shopifyId = getShopifyId(review.productId.toString());
  
  if (shopifyId) {
    return {
      ...review,
      originalProductId: review.productId, // Keep the original for reference
      productId: shopifyId
    };
  }
  
  return review;
}

/**
 * Add a new product mapping
 */
export function addProductMapping(shopifyId: string, stampedId: string, title: string, handle: string) {
  initializeMappings();
  
  // Clean the IDs
  const cleanShopifyId = cleanProductId(shopifyId);
  const cleanStampedId = cleanProductId(stampedId);
  
  // Check if mapping already exists
  const existing = inMemoryMappings.find(mapping => 
    cleanProductId(mapping.shopifyId) === cleanShopifyId ||
    cleanProductId(mapping.stampedId) === cleanStampedId
  );
  
  if (existing) {
    console.log(`[ProductMiddleware] Mapping already exists for ${cleanShopifyId} or ${cleanStampedId}`);
    return false;
  }
  
  // Add the new mapping
  const newMapping: ProductMapping = {
    shopifyId: cleanShopifyId,
    stampedId: cleanStampedId,
    title: title || '',
    handle: handle || ''
  };
  
  inMemoryMappings.push(newMapping);
  
  console.log(`[ProductMiddleware] Added new mapping: ${cleanShopifyId} <-> ${cleanStampedId}`);
  return true;
}

/**
 * Get all product mappings (for admin tools)
 */
export function getAllMappings(): ProductMapping[] {
  initializeMappings();
  return inMemoryMappings;
}

/**
 * Process CSV import data to extract product mappings
 * This is useful for automatically creating mappings from imported reviews
 */
export function processCSVImport(csvData: CSVImportRow[]): ProductMapping[] {
  const newMappings: ProductMapping[] = [];
  
  csvData.forEach(row => {
    // Skip if missing essential data
    if (!row.product_id) return;
    
    // Extract data from CSV row
    const stampedId = row.product_id.toString();
    const handle = row.product_handle || '';
    const title = row.productTitle || '';
    
    // Try to match to existing Shopify products based on handle or title
    // For now we'll just create a mapping with the same ID
    // In a real implementation, you'd query Shopify API to find the matching product
    const shopifyId = stampedId;
    
    // Create a new mapping
    if (stampedId && shopifyId) {
      const newMapping: ProductMapping = {
        shopifyId,
        stampedId,
        title,
        handle
      };
      
      // Check if this mapping already exists
      const exists = inMemoryMappings.some(
        m => m.shopifyId === shopifyId || m.stampedId === stampedId
      );
      
      if (!exists) {
        newMappings.push(newMapping);
      }
    }
  });
  
  // Add all new mappings to in-memory store
  if (newMappings.length > 0) {
    inMemoryMappings.push(...newMappings);
    console.log(`[ProductMiddleware] Added ${newMappings.length} new mappings from CSV import`);
  }
  
  return newMappings;
}

/**
 * Find all relevant Stamped IDs for a product
 * Returns an array of potential Stamped IDs to search for
 * This helps improve the chances of finding reviews for a product
 */
export function findAllRelevantStampedIds(shopifyId: string, title?: string, handle?: string): string[] {
  // Get the direct mappings
  const mappedIds = getStampedId(shopifyId, title, handle);
  
  // Always include the original ID as a fallback
  const cleanId = cleanProductId(shopifyId);
  if (!mappedIds.includes(cleanId)) {
    mappedIds.push(cleanId);
  }
  
  // If we have a product handle, include variants of it
  if (handle) {
    // Remove common words that might cause mismatches
    const simplifiedHandle = handle
      .replace(/-oak-smoked-/g, '-')
      .replace(/-pack/g, '')
      .replace(/-wild-caught/g, '');
    
    // If the simplified handle is different, add it
    if (simplifiedHandle !== handle) {
      // Look for mappings with the simplified handle
      const handleMatches = inMemoryMappings.filter(mapping => 
        mapping.handle.includes(simplifiedHandle) ||
        simplifiedHandle.includes(mapping.handle)
      );
      
      // Add any matches found
      handleMatches.forEach(match => {
        if (!mappedIds.includes(match.stampedId)) {
          mappedIds.push(match.stampedId);
        }
      });
    }
  }
  
  return mappedIds;
}