// lib/reviews/product-id-middleware.ts
import { STAMPED_CONFIG } from "./config";

/**
 * Product ID Translation Middleware
 * 
 * This middleware helps bridge the gap between Shopify product IDs and Stamped.io product IDs.
 * It provides mapping and translation functions to match products across both systems.
 */

// Type definitions for product mapping
export interface ProductMapping {
  shopifyId: string;
  stampedId: string;
  title: string;
  handle: string;
}

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

/**
 * Gets a Stamped ID from a Shopify ID using various matching strategies
 */
export function getStampedId(shopifyId: string, title?: string, handle?: string): string[] {
  // Clean the Shopify ID (remove the gid:// prefix if present)
  const cleanShopifyId = cleanProductId(shopifyId);
  
  // Strategy 1: Direct mapping lookup
  const directMapping = PRODUCT_MAPPINGS.find(mapping => 
    cleanProductId(mapping.shopifyId) === cleanShopifyId
  );
  
  if (directMapping) {
    console.log(`[ProductMiddleware] Direct mapping found: ${cleanShopifyId} -> ${directMapping.stampedId}`);
    return [directMapping.stampedId];
  }
  
  // Strategy 2: Title matching
  if (title) {
    const titleMatches = PRODUCT_MAPPINGS.filter(mapping => 
      mapping.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(mapping.title.toLowerCase())
    );
    
    if (titleMatches.length > 0) {
      console.log(`[ProductMiddleware] Title match found for "${title}": ${titleMatches.map(m => m.stampedId).join(', ')}`);
      return titleMatches.map(m => m.stampedId);
    }
  }
  
  // Strategy 3: Handle matching
  if (handle) {
    const handleMatches = PRODUCT_MAPPINGS.filter(mapping => 
      mapping.handle.toLowerCase().includes(handle.toLowerCase()) ||
      handle.toLowerCase().includes(mapping.handle.toLowerCase())
    );
    
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
  // Clean the Stamped ID
  const cleanStampedId = cleanProductId(stampedId);
  
  // Look for a mapping
  const mapping = PRODUCT_MAPPINGS.find(mapping => 
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
  // Check if mapping already exists
  const existing = PRODUCT_MAPPINGS.find(mapping => 
    cleanProductId(mapping.shopifyId) === cleanProductId(shopifyId) ||
    cleanProductId(mapping.stampedId) === cleanProductId(stampedId)
  );
  
  if (existing) {
    console.log(`[ProductMiddleware] Mapping already exists for ${shopifyId} or ${stampedId}`);
    return false;
  }
  
  // Add the new mapping
  PRODUCT_MAPPINGS.push({
    shopifyId: cleanProductId(shopifyId),
    stampedId: cleanProductId(stampedId),
    title,
    handle
  });
  
  console.log(`[ProductMiddleware] Added new mapping: ${shopifyId} <-> ${stampedId}`);
  return true;
}

/**
 * Find all relevant Stamped IDs for a product
 * Returns an array of potential Stamped IDs to search for
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
      const handleMatches = PRODUCT_MAPPINGS.filter(mapping => 
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