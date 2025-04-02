// lib/reviews/shopify-stamped-integration.ts
import { STAMPED_CONFIG } from "./config";

/**
 * Integration to improve the connection between Shopify product IDs and Stamped.io reviews
 */
export class ShopifyStampedIntegration {
  private readonly basicAuthHeader: string;
  
  constructor() {
    // Set up authentication for Stamped API
    const username = STAMPED_CONFIG.publicKey;
    const password = STAMPED_CONFIG.privateKey;
    this.basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
  
  /**
   * Extract the numeric part from Shopify GID
   * @param shopifyId GID format ID (gid://shopify/Product/7954178637884)
   * @returns Numeric ID (7954178637884)
   */
  extractShopifyNumericId(shopifyId: string): string {
    if (!shopifyId) return '';
    
    // Extract the numeric part from the GID format
    const match = shopifyId.match(/\/Product\/(\d+)/);
    return match ? match[1] : shopifyId;
  }
  
  /**
   * Makes a request to the Stamped API
   */
  private async makeRequest(url: string, options: RequestInit = {}) {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': this.basicAuthHeader,
        ...(options.headers || {})
      }
    };
    
    console.log(`[StampedAPI] Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      
      console.log(`[StampedAPI] Response Status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`[StampedAPI] Error: ${response.status} ${response.statusText}`);
        console.error(`[StampedAPI] Full Response: ${responseText}`);
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Try to parse as JSON
      try {
        return responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error(`[StampedAPI] JSON Parse Error: ${parseError}`);
        return { raw: responseText };
      }
    } catch (error) {
      console.error(`[StampedAPI] Request Error:`, error);
      throw error;
    }
  }
  
  /**
   * Get reviews directly using Stamped.io's productId parameter
   */
  private async getReviewsByProductId(productId: string, page: number = 1, take: number = 50) {
    const params = new URLSearchParams({
      productId,
      sId: STAMPED_CONFIG.storeHash,
      apiKey: STAMPED_CONFIG.publicKey,
      page: page.toString(),
      storeUrl: STAMPED_CONFIG.storeUrl,
      take: take.toString(),
      sortReviews: 'recent'
    });
    
    const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
    return await this.makeRequest(url);
  }
  
  /**
   * Get all reviews for the store
   */
  private async getAllStoreReviews(page: number = 1, take: number = 50) {
    const params = new URLSearchParams({
      sId: STAMPED_CONFIG.storeHash,
      apiKey: STAMPED_CONFIG.publicKey,
      page: page.toString(),
      storeUrl: STAMPED_CONFIG.storeUrl,
      take: take.toString()
    });
    
    const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
    return await this.makeRequest(url);
  }
  
  /**
   * Get reviews by product handle
   */
  async getProductReviewsByProductHandle(productHandle: string, page: number = 1, take: number = 50) {
    console.log(`[StampedAPI] Looking for reviews with product handle: ${productHandle}`);
    
    try {
      // First approach: Try searching with the handle as a search term
      const params = new URLSearchParams({
        sId: STAMPED_CONFIG.storeHash,
        apiKey: STAMPED_CONFIG.publicKey,
        page: page.toString(),
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: take.toString(),
        search: productHandle.replace(/-/g, ' ')  // Convert handle format (dashes) to spaces for search
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const response = await this.makeRequest(url);
      
      // If we find potential matches, filter them to ensure they're for this specific product
      if (response.data && response.data.length > 0) {
        console.log(`[StampedAPI] Found ${response.data.length} potential matches for handle: ${productHandle}`);
        
        // Filter to find reviews that mention this product or have content about this product
        const productTitle = productHandle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const matchingReviews = response.data.filter((review: any) => {
          // Check if reviewMessage contains the handle or product name
          if (review.reviewMessage) {
            const normalizedMessage = review.reviewMessage.toLowerCase();
            const normalizedHandle = productHandle.replace(/-/g, ' ').toLowerCase();
            
            if (normalizedMessage.includes(normalizedHandle)) {
              return true;
            }
          }
          
          // Check if productName matches
          if (review.productName && productTitle) {
            const normalizedProductName = review.productName.toLowerCase();
            const normalizedTitle = productTitle.toLowerCase();
            
            if (normalizedProductName.includes(normalizedTitle) || 
                normalizedTitle.includes(normalizedProductName)) {
              return true;
            }
          }
          
          // Check for "For: Product Name" pattern
          if (review.reviewMessage && review.reviewMessage.includes('For:')) {
            const forPattern = /For:\s+([^|]+)(?:\s*\|.*)?/i;
            const messageMatch = review.reviewMessage.match(forPattern);
            
            if (messageMatch && messageMatch[1]) {
              const forProduct = messageMatch[1].trim().toLowerCase();
              const normalizedHandle = productHandle.replace(/-/g, ' ').toLowerCase();
              
              if (forProduct.includes(normalizedHandle) || normalizedHandle.includes(forProduct)) {
                return true;
              }
            }
          }
          
          return false;
        });
        
        // Return filtered results
        return {
          ...response,
          data: matchingReviews,
          total: matchingReviews.length,
          originalTotal: response.data.length,
          filtered: true
        };
      }
      
      // If no reviews found or none passed the filter, return empty results
      return { 
        data: [], 
        total: 0,
        filtered: true,
        originalTotal: response.data ? response.data.length : 0
      };
    } catch (error) {
      console.error(`[StampedAPI] Error getting reviews for product handle ${productHandle}:`, error);
      return { 
        data: [], 
        total: 0,
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Filter reviews by looking for product info in various review fields
   */
  private filterReviewsByProductInfo(reviews: any[], shopifyProductId: string, numericId: string) {
    // For logging
    let foundByProductId = 0;
    let foundByTitle = 0;
    let foundByMessage = 0;
    
    // Get product title and handle if available
    const productInfo = this.extractProductTitleFromUrl(shopifyProductId);
    
    const filteredReviews = reviews.filter(review => {
      // Check direct productId match first (most reliable)
      if (review.productId && review.productId.toString() === numericId) {
        foundByProductId++;
        return true;
      }
      
      // Check productName against our product title
      if (productInfo.title && review.productName) {
        const productNameLower = review.productName.toLowerCase();
        const titleLower = productInfo.title.toLowerCase();
        
        if (productNameLower.includes(titleLower) || titleLower.includes(productNameLower)) {
          foundByTitle++;
          return true;
        }
      }
      
      // Check in reviewMessage for "For: product name" format
      if (review.reviewMessage) {
        const forPattern = /For:\s+([^|]+)(?:\s*\|.*)?/i;
        const messageMatch = review.reviewMessage.match(forPattern);
        
        if (messageMatch && messageMatch[1]) {
          const forProduct = messageMatch[1].trim().toLowerCase();
          
          if (productInfo.title && forProduct.includes(productInfo.title.toLowerCase())) {
            foundByMessage++;
            return true;
          }
          
          if (productInfo.handle && forProduct.includes(productInfo.handle.toLowerCase().replace(/-/g, ' '))) {
            foundByMessage++;
            return true;
          }
        }
      }
      
      return false;
    });
    
    console.log(`[StampedAPI] Filtering results: ${foundByProductId} by ID, ${foundByTitle} by title, ${foundByMessage} by message content`);
    return filteredReviews;
  }
  
  /**
   * Extract product title and handle from Shopify ID or URL
   */
  private extractProductTitleFromUrl(shopifyId: string): { title: string, handle: string } {
    // Default empty result
    const result = { title: '', handle: '' };
    
    // Check if we have any handle or title information in the ID string
    // This can happen if additional metadata was passed from the frontend
    const urlMatch = shopifyId.match(/\/products\/([^/?#]+)/);
    if (urlMatch) {
      result.handle = urlMatch[1];
      // Convert handle to a possible title (replace hyphens with spaces, capitalize words)
      result.title = urlMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    return result;
  }
  
  /**
   * Get all store reviews and find matches for the given product
   * @param shopifyProductId Shopify product ID in gid format
   * @param page Page number for pagination
   * @param take Number of reviews to fetch per page
   */
  async getProductReviewsByShopifyId(shopifyProductId: string, page: number = 1, take: number = 50) {
    const numericId = this.extractShopifyNumericId(shopifyProductId);
    console.log(`[StampedAPI] Looking for reviews with Shopify product ID: ${numericId}`);
    
    try {
      // Extract handle from Shopify ID if available
      const productInfo = this.extractProductTitleFromUrl(shopifyProductId);
      
      // If we have a handle, try to search by handle first
      if (productInfo.handle) {
        console.log(`[StampedAPI] Product has handle: ${productInfo.handle}, trying handle search first`);
        const handleResults = await this.getProductReviewsByProductHandle(productInfo.handle, page, take);
        
        // If we found reviews by handle, return them
        if (handleResults.data && handleResults.data.length > 0) {
          console.log(`[StampedAPI] Found ${handleResults.data.length} reviews by handle search`);
          return handleResults;
        }
        
        console.log(`[StampedAPI] No reviews found by handle, falling back to ID search`);
      }
      
      // First, try direct product ID matching
      const directMatches = await this.getReviewsByProductId(numericId, page, take);
      
      // If we find direct matches, return them
      if (directMatches.data && directMatches.data.length > 0) {
        console.log(`[StampedAPI] Found ${directMatches.data.length} direct matches by product ID`);
        return directMatches;
      }
      
      // If no direct matches, try to get all reviews and then filter them
      console.log(`[StampedAPI] No direct matches found, attempting to search all reviews`);
      const allReviews = await this.getAllStoreReviews(page, 100); // Get more reviews to search through
      
      // First, try to find reviews by exact productId match
      const exactMatches = allReviews.data.filter((review: any) => 
        review.productId && review.productId.toString() === numericId
      );
      
      if (exactMatches.length > 0) {
        console.log(`[StampedAPI] Found ${exactMatches.length} matches by exact product ID filtering`);
        return {
          ...allReviews,
          data: exactMatches,
          total: exactMatches.length,
          originalTotal: allReviews.data.length,
          filtered: true
        };
      }
      
      // Finally, try fuzzy searching within review content
      console.log(`[StampedAPI] Attempting fuzzy search in review content...`);
      const reviewsWithProductInfo = this.filterReviewsByProductInfo(allReviews.data, shopifyProductId, numericId);
      
      return {
        ...allReviews,
        data: reviewsWithProductInfo,
        total: reviewsWithProductInfo.length,
        originalTotal: allReviews.data.length,
        filtered: true
      };
    } catch (error) {
      console.error(`[StampedAPI] Error getting reviews for product ${shopifyProductId}:`, error);
      return { 
        data: [], 
        total: 0,
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
}