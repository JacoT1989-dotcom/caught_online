// lib/reviews/enhanced-stamped-client.ts
import { STAMPED_CONFIG } from "./config";

/**
 * Enhanced client for interacting with the Stamped.io API
 * With improved error handling, retry logic, and caching
 */
export class EnhancedStampedClient {
  private readonly basicAuthHeader: string;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds
  
  constructor() {
    // Create Basic Auth token as specified by Stamped dev team
    const username = STAMPED_CONFIG.publicKey;
    const password = STAMPED_CONFIG.privateKey;
    this.basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    
    console.log('Stamped API Configuration:');
    console.log(`  Store Hash: ${STAMPED_CONFIG.storeHash}`);
    console.log(`  Store URL: ${STAMPED_CONFIG.storeUrl}`);
    console.log(`  Public Key: ${username.substring(0, 10)}...`);
    console.log(`  Private Key: ${password.substring(0, 5)}...`);
  }
  
  /**
   * Sanitizes a product ID to make it compatible with Stamped API
   * Made public to allow access from API routes
   */
  public sanitizeProductId(productId: string): string {
    // If it's a Shopify gid, extract just the numeric part
    if (productId.includes('gid://shopify/Product/')) {
      const idMatch = productId.match(/\/Product\/(\d+)/);
      if (idMatch && idMatch[1]) {
        console.log(`Sanitized product ID from ${productId} to ${idMatch[1]}`);
        return idMatch[1];
      }
    }
    
    // If it contains slashes but isn't a gid format, take the last part
    if (productId.includes('/') && !productId.includes('gid://')) {
      const parts = productId.split('/');
      const cleanId = parts[parts.length - 1];
      console.log(`Sanitized product ID from ${productId} to ${cleanId}`);
      return cleanId;
    }
    
    return productId;
  }
  
  /**
   * Makes a request to the Stamped API with detailed logging and retry logic
   */
  private async makeRequest(url: string, options: RequestInit = {}, retries = 3, cacheKey?: string): Promise<any> {
    // Check cache first if a cache key is provided
    if (cacheKey && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey)!;
      const now = Date.now();
      
      // Use cached data if it's still valid
      if (now - cachedData.timestamp < this.cacheTTL) {
        console.log(`[StampedAPI] Using cached data for: ${cacheKey}`);
        return cachedData.data;
      } else {
        // Remove expired cache entry
        this.cache.delete(cacheKey);
      }
    }
    
    // Merge default headers with provided options
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': this.basicAuthHeader,
        ...(options.headers || {})
      },
      // Add timeout for fetch requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    };
    
    console.log(`[StampedAPI] Request: ${options.method || 'GET'} ${url}`);
    console.log(`[StampedAPI] Headers: ${JSON.stringify(requestOptions.headers)}`);
    
    if (options.body) {
      console.log(`[StampedAPI] Body: ${typeof options.body === 'string' ? options.body.substring(0, 200) : '[binary data]'}...`);
    }
    
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
        const parsedData = responseText ? JSON.parse(responseText) : {};
        
        // Store in cache if a cache key is provided
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
          });
        }
        
        return parsedData;
      } catch (parseError) {
        console.error(`[StampedAPI] JSON Parse Error: ${parseError}`);
        return { raw: responseText };
      }
    } catch (error) {
      // Check if we should retry
      if (retries > 0) {
        const isTimeout = error instanceof Error && 
          (error.name === 'AbortError' || 
          (error.cause && (error.cause as any).code === 'UND_ERR_CONNECT_TIMEOUT'));
        
        if (isTimeout) {
          console.log(`[StampedAPI] Connection timeout. Retrying (${retries} attempts left)...`);
          // Exponential backoff
          const delay = Math.pow(2, 4 - retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(url, options, retries - 1, cacheKey);
        }
      }
      
      console.error(`[StampedAPI] Request Error:`, error);
      
      // Use cached data as fallback even if expired
      if (cacheKey && this.cache.has(cacheKey)) {
        console.log(`[StampedAPI] Using expired cached data as fallback for: ${cacheKey}`);
        return this.cache.get(cacheKey)!.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get reviews for a product using widget API
   */
  async getProductReviews(productId: string, page: number = 1): Promise<any> {
    const cleanProductId = this.sanitizeProductId(productId);
    const cacheKey = `product_reviews_${cleanProductId}_${page}`;
    
    try {
      const params = new URLSearchParams({
        productId: cleanProductId,
        sId: STAMPED_CONFIG.storeHash,
        apiKey: STAMPED_CONFIG.publicKey,
        page: page.toString(),
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: '10',          // Number of reviews per page
        sortReviews: 'recent' // Sort by most recent
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      return await this.makeRequest(url, {}, 3, cacheKey);
    } catch (error) {
      console.error(`[StampedAPI] Get Reviews Error for product ${cleanProductId}:`, error);
      
      // Return empty result on error
      return { 
        reviews: [], 
        count: 0,
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Get rating summary for a product
   */
  async getProductRatingSummary(productId: string): Promise<any> {
    const cleanProductId = this.sanitizeProductId(productId);
    const cacheKey = `product_rating_${cleanProductId}`;
    
    try {
      // Using the method from the documentation with productIds payload
      const bodyData = {
        productIds: [
          {
            productId: cleanProductId,
            productSKU: "",
            productType: "",
            productTitle: ""
          }
        ],
        apiKey: STAMPED_CONFIG.publicKey,
        storeUrl: STAMPED_CONFIG.storeUrl
      };
      
      const url = 'https://stamped.io/api/widget/badges';
      return await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      }, 3, cacheKey);
    } catch (error) {
      console.error(`[StampedAPI] Get Rating Error for product ${cleanProductId}:`, error);
      
      // Return default rating on error
      return { 
        rating: 0, 
        total: 0, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Submit a review
   */
  async submitReview(reviewData: any): Promise<any> {
    const cleanProductId = this.sanitizeProductId(reviewData.productId);
    
    try {
      // Create form data based on documentation
      const formData = new URLSearchParams();
      
      // Add required fields from the documentation
      formData.append('productId', cleanProductId);
      formData.append('author', reviewData.author);
      formData.append('email', reviewData.email);
      formData.append('reviewRating', reviewData.reviewRating.toString());
      formData.append('reviewTitle', reviewData.reviewTitle);
      formData.append('reviewMessage', reviewData.reviewMessage);
      formData.append('reviewRecommendProduct', 'true');
      formData.append('productName', reviewData.productName || '');
      
      if (reviewData.productSKU) formData.append('productSKU', reviewData.productSKU);
      if (reviewData.productUrl) formData.append('productUrl', reviewData.productUrl);
      if (reviewData.location) formData.append('location', reviewData.location);
      
      formData.append('reviewSource', 'api');
      
      const params = new URLSearchParams({
        apiKey: STAMPED_CONFIG.publicKey,
        sId: STAMPED_CONFIG.storeHash
      });
      
      const url = `https://stamped.io/api/reviews3?${params.toString()}`;
      // Don't cache submission requests
      return await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': this.basicAuthHeader
        },
        body: formData.toString()
      }, 2);
    } catch (error) {
      console.error(`[StampedAPI] Submit Review Error for product ${cleanProductId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Get all reviews from the store (administrative access)
   * This uses the dashboard API which should show all reviews
   */
  async getAllStoreReviews(limit: number = 100): Promise<any> {
    const cacheKey = `store_reviews_${limit}`;
    
    try {
      const url = `https://stamped.io/api/v2/${STAMPED_CONFIG.storeHash}/dashboard/reviews?limit=${limit}`;
      
      console.log(`[StampedAPI] Fetching all store reviews using dashboard API: ${url}`);
      
      return await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.basicAuthHeader
        }
      }, 3, cacheKey);
    } catch (error) {
      console.error('[StampedAPI] Get All Store Reviews Error:', error);
      
      // Return empty result on error
      return { 
        results: [], 
        count: 0,
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Clear the cache for specific keys or all keys
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`[StampedAPI] Cleared cache for key: ${key}`);
    } else {
      this.cache.clear();
      console.log(`[StampedAPI] Cleared all cache entries`);
    }
  }
  
  /**
   * Verify API connection by listing store information
   */
  async verifyConnection(): Promise<any> {
    try {
      // Try to get some reviews as a connection test
      const params = new URLSearchParams({
        apiKey: STAMPED_CONFIG.publicKey,
        sId: STAMPED_CONFIG.storeHash,
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: '1'  // Only get 1 review to minimize data transfer
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const result = await this.makeRequest(url, {}, 2);
      
      return { 
        success: true, 
        data: result,
        message: `Successfully connected to Stamped API for store ${STAMPED_CONFIG.storeHash}`
      };
    } catch (error) {
      console.error('[StampedAPI] Connection verification failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to connect to Stamped API. Check your credentials and network connection.'
      };
    }
  }
  
  /**
   * Generate fallback review data when API is unavailable
   * This provides a better user experience during API outages
   */
  generateFallbackReviews(productId: string, productTitle: string): any {
    // Return an empty response structure that matches what the API would return
    return {
      reviews: [],
      count: 0,
      page: 1,
      totalPages: 0,
      _fallback: true, // Mark this as fallback data
      message: "Using fallback data due to API connection issues"
    };
  }
  
  /**
   * Import reviews from CSV data
   * This is a helper method to process CSV review imports
   * Submits each review to the Stamped API
   */
  async importReviewsFromCSV(csvData: any[]): Promise<any> {
    // Process each review row for import
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      reviewIds: [] as string[] // Track IDs of successfully imported reviews
    };
    
    try {
      console.log(`[StampedAPI] Starting import of ${csvData.length} reviews`);
      
      // For each review in the CSV, create a submission to the Stamped API
      for (const row of csvData) {
        try {
          // Map CSV fields to API fields
          const reviewData = {
            productId: row.product_id,
            author: row.author,
            email: row.email || 'imported@example.com',
            reviewRating: parseInt(row.rating.toString()),
            reviewTitle: row.title || row.productTitle || 'Imported Review',
            reviewMessage: row.body,
            productName: row.productTitle || '',
            productSKU: row.product_sku || '',
            productUrl: row.productUrl || '',
            location: row.location || 'South Africa',
            reviewDate: row.created_at // Pass the created_at date
          };
          
          // Skip if missing required fields
          if (!reviewData.productId || !reviewData.author || !reviewData.reviewMessage) {
            results.failed++;
            results.errors.push(`Missing required fields for review: ${JSON.stringify(row)}`);
            continue;
          }
          
          console.log(`[StampedAPI] Submitting review for product ${reviewData.productId} by ${reviewData.author}`);
          
          // Create form data for the submission
          const formData = new URLSearchParams();
          
          // Add required fields to the form data
          formData.append('productId', this.sanitizeProductId(reviewData.productId));
          formData.append('author', reviewData.author);
          formData.append('email', reviewData.email);
          formData.append('reviewRating', reviewData.reviewRating.toString());
          formData.append('reviewTitle', reviewData.reviewTitle);
          formData.append('reviewMessage', reviewData.reviewMessage);
          
          // Add optional fields if available
          if (reviewData.productName) formData.append('productName', reviewData.productName);
          if (reviewData.productSKU) formData.append('productSKU', reviewData.productSKU);
          if (reviewData.productUrl) formData.append('productUrl', reviewData.productUrl);
          if (reviewData.location) formData.append('location', reviewData.location);
          if (reviewData.reviewDate) formData.append('reviewDate', reviewData.reviewDate);
          
          // Set published status if available
          if (row.published) formData.append('published', row.published);
          
          // Mark as imported review
          formData.append('reviewSource', 'api-import');
          
          // Set recommended status if available
          if (row.recommended) formData.append('reviewRecommendProduct', row.recommended);
          
          // Prepare API URL with query parameters
          const params = new URLSearchParams({
            apiKey: STAMPED_CONFIG.publicKey,
            sId: STAMPED_CONFIG.storeHash
          });
          
          const url = `https://stamped.io/api/reviews3?${params.toString()}`;
          
          // Submit the review to Stamped API
          const response = await this.makeRequest(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': this.basicAuthHeader
            },
            body: formData.toString()
          }, 2);
          
          // Check for success
          if (response && response.id) {
            console.log(`[StampedAPI] Successfully imported review, ID: ${response.id}`);
            results.success++;
            results.reviewIds.push(response.id);
          } else {
            console.log(`[StampedAPI] Failed to import review:`, response);
            results.failed++;
            results.errors.push(`API returned unexpected response: ${JSON.stringify(response)}`);
          }
          
          // Add a small delay between submissions to avoid rate limiting (500ms)
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`[StampedAPI] Error importing review:`, error);
          results.failed++;
          results.errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      console.log(`[StampedAPI] Import complete. Success: ${results.success}, Failed: ${results.failed}`);
      
      return {
        success: true,
        message: `Processed ${csvData.length} reviews. Success: ${results.success}, Failed: ${results.failed}`,
        results
      };
    } catch (error) {
      console.error(`[StampedAPI] Import failed with error:`, error);
      return {
        success: false,
        message: `Failed to import reviews: ${error instanceof Error ? error.message : String(error)}`,
        results
      };
    }
  }
}