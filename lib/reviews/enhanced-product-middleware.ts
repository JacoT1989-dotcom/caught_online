// lib/reviews/enhanced-product-middleware.ts

/**
 * CSV Import Row Interface
 */
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

/**
 * Product Identification Strategies for E-commerce Platforms
 * Focused on Shopify product ID extraction and mapping
 */
export interface ProductMapping {
  shopifyId: string;      // Numeric Shopify Product ID
  stampedId: string;      // Stamped.io Product Identifier
  handle: string;         // Product URL handle
  title: string;          // Product title
}

/**
 * Comprehensive product ID cleaning and extraction
 */
export function cleanProductId(productId: string | undefined): string {
  if (!productId) return '';
  
  // Convert to string to handle potential type variations
  const id = String(productId);
  
  // Shopify GID handling (gid://shopify/Product/1234567890)
  if (id.includes('gid://shopify/Product/')) {
    const match = id.match(/\/Product\/(\d+)/);
    return match ? match[1] : '';
  }
  
  // URL-based product ID extraction
  if (id.includes('/products/')) {
    const match = id.match(/\/products\/([^/]+)/);
    return match ? match[1] : '';
  }
  
  // Direct numeric ID
  const numericId = id.replace(/\D/g, '');
  
  return numericId || id;
}

/**
 * Extract product handle from various input formats
 */
export function extractProductHandle(input: string | undefined): string {
  if (!input) return '';
  
  // URL handle extraction
  const urlMatch = input.match(/\/products\/([^/?#]+)/);
  if (urlMatch) return urlMatch[1];
  
  // Direct handle input
  return input.toLowerCase()
    .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric characters
    .replace(/-+/g, '-')         // Replace multiple dashes
    .trim();
}

/**
 * Normalize product title for matching
 */
function normalizeProductTitle(title: string | undefined): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')  // Remove special characters
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
}

/**
 * Product ID mapping and translation service
 */
export class ProductIdMapper {
  // Static mapping of known product relationships
  private static productMappings: ProductMapping[] = [
    // Predefined mappings can be added here
  ];

  /**
   * Find potential Stamped IDs for a given product
   */
  static findPotentialStampedIds(
    shopifyId: string, 
    title?: string, 
    handle?: string
  ): string[] {
    const cleanId = cleanProductId(shopifyId);
    const normalizedTitle = normalizeProductTitle(title);
    const cleanHandle = extractProductHandle(handle);

    const potentialIds: string[] = [];

    // 1. Direct ID match from mappings
    const directMapping = this.productMappings.find(
      mapping => cleanProductId(mapping.shopifyId) === cleanId
    );
    if (directMapping) {
      potentialIds.push(directMapping.stampedId);
    }

    // 2. Title-based matching
    if (normalizedTitle) {
      const titleMatches = this.productMappings.filter(mapping => 
        normalizeProductTitle(mapping.title).includes(normalizedTitle)
      );
      potentialIds.push(...titleMatches.map(m => m.stampedId));
    }

    // 3. Handle-based matching
    if (cleanHandle) {
      const handleMatches = this.productMappings.filter(mapping => 
        mapping.handle.includes(cleanHandle)
      );
      potentialIds.push(...handleMatches.map(m => m.stampedId));
    }

    // 4. Always include the original/cleaned ID as a fallback
    if (!potentialIds.includes(cleanId)) {
      potentialIds.push(cleanId);
    }

    // Remove duplicates and filter out empty strings
    return [...new Set(potentialIds)].filter(Boolean);
  }

  /**
   * Add a new product mapping
   */
  static addProductMapping(mapping: ProductMapping): boolean {
    const existingMapping = this.productMappings.find(
      m => cleanProductId(m.shopifyId) === cleanProductId(mapping.shopifyId) ||
           m.stampedId === mapping.stampedId
    );

    if (existingMapping) {
      return false;
    }

    this.productMappings.push({
      ...mapping,
      shopifyId: cleanProductId(mapping.shopifyId),
      stampedId: cleanProductId(mapping.stampedId)
    });

    return true;
  }

  /**
   * Get all current product mappings
   */
  static getAllMappings(): ProductMapping[] {
    return [...this.productMappings];
  }

  /**
   * Process CSV import data to extract product mappings
   */
  static processCSVImport(csvData: CSVImportRow[]): ProductMapping[] {
    const newMappings: ProductMapping[] = [];
    
    csvData.forEach(row => {
      // Skip if missing essential data
      if (!row.product_id) return;
      
      // Extract data from CSV row
      const stampedId = row.product_id.toString();
      const handle = row.product_handle || '';
      const title = row.productTitle || '';
      
      // Use the same ID as a fallback
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
        const exists = this.productMappings.some(
          m => m.shopifyId === shopifyId || m.stampedId === stampedId
        );
        
        if (!exists) {
          newMappings.push(newMapping);
        }
      }
    });
    
    // Add all new mappings to in-memory store
    if (newMappings.length > 0) {
      this.productMappings.push(...newMappings);
    }
    
    return newMappings;
  }
}

// Expose key functions for direct use
export const getStampedId = ProductIdMapper.findPotentialStampedIds;
export const findAllRelevantStampedIds = ProductIdMapper.findPotentialStampedIds;
export const addProductMapping = ProductIdMapper.addProductMapping;
export const processCSVImport = ProductIdMapper.processCSVImport;