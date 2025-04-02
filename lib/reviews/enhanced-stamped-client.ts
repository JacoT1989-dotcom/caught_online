// lib/reviews/enhanced-stamped-client.ts
import { STAMPED_CONFIG } from "./config";

/**
 * An enhanced client for interacting with the Stamped.io API
 * With improved error handling, debugging, and product matching
 */
export class StampedApiClient {
  private readonly basicAuthHeader: string;
  
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
   * Makes a request to the Stamped API with detailed logging
   */
  private async makeRequest(url: string, options: RequestInit = {}) {
    // Merge default headers with provided options
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': this.basicAuthHeader,
        ...(options.headers || {})
      }
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
      console.log(`[StampedAPI] Response Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
      console.log(`[StampedAPI] Response Body: ${responseText.substring(0, 200)}...`);
      
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
   * Extract the "For: Product Name" from review message or title
   * This helps match reviews to their specific products
   */
  private extractProductInfo(review: any): { forProduct: string, extractedFrom: string } {
    // Look for the pattern "For: Product Name" in various fields
    const forPattern = /For:\s+([^|]+)(?:\s*\|.*)?/;
    
    // Check in review message
    if (review.reviewMessage) {
      const messageMatch = review.reviewMessage.match(forPattern);
      if (messageMatch && messageMatch[1]) {
        return { 
          forProduct: messageMatch[1].trim(), 
          extractedFrom: 'message' 
        };
      }
    }
    
    // Check in review title
    if (review.reviewTitle) {
      const titleMatch = review.reviewTitle.match(forPattern);
      if (titleMatch && titleMatch[1]) {
        return { 
          forProduct: titleMatch[1].trim(), 
          extractedFrom: 'title' 
        };
      }
    }
    
    // Check in author field (sometimes appears as "By: Name For: Product")
    if (review.author) {
      const authorMatch = review.author.match(forPattern);
      if (authorMatch && authorMatch[1]) {
        return { 
          forProduct: authorMatch[1].trim(), 
          extractedFrom: 'author' 
        };
      }
    }
    
    // If no match found, try to use product name from the review if available
    if (review.productName) {
      return { 
        forProduct: review.productName.trim(), 
        extractedFrom: 'productName' 
      };
    }
    
    // If all else fails, return empty string
    return { forProduct: '', extractedFrom: 'none' };
  }
  
  /**
   * Determine if a review matches a specific product based on name, title, etc.
   */
  private isReviewMatchingProduct(review: Record<string, any>, productTitle: string, productId: string, productHandle: string): boolean {
    if (!review) return false;
    
    // If no product title provided, don't filter
    if (!productTitle && !productHandle) return true;
    
    // Extract the product info from the review
    const { forProduct } = this.extractProductInfo(review);
    
    // If we couldn't extract any product info, fall back to checking if the review's productId matches
    if (!forProduct) {
      return String(review.productId) === this.sanitizeProductId(productId);
    }
    
    // Normalize strings for comparison - remove special chars, lowercase, etc.
    const normalizeString = (str: string) => {
      return str.toLowerCase()
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();
    };
    
    const normalizedForProduct = normalizeString(forProduct);
    const normalizedProductTitle = normalizeString(productTitle);
    const normalizedProductHandle = normalizeString(productHandle.replace(/-/g, ' '));
    
    // Check for a match with product title
    if (normalizedProductTitle && 
        (normalizedForProduct.includes(normalizedProductTitle) || 
         normalizedProductTitle.includes(normalizedForProduct))) {
      return true;
    }
    
    // Check for a match with product handle
    if (normalizedProductHandle && 
        (normalizedForProduct.includes(normalizedProductHandle) || 
         normalizedProductHandle.includes(normalizedForProduct))) {
      return true;
    }
    
    // If we get here, no match was found
    return false;
  }
  
  /**
   * Get reviews for a product using widget API with product matching
   */
  async getProductReviews(productId: string, page: number = 1, productTitle: string = '', productHandle: string = '') {
    const cleanProductId = this.sanitizeProductId(productId);
    
    try {
      // Step 1: If product handle is provided, try to use it for search first
      if (productHandle) {
        console.log(`[StampedAPI] Attempting to find reviews using product handle: ${productHandle}`);
        
        // First, search by tag with the handle
        const handleParams = new URLSearchParams({
          sId: STAMPED_CONFIG.storeHash,
          apiKey: STAMPED_CONFIG.publicKey,
          page: page.toString(),
          storeUrl: STAMPED_CONFIG.storeUrl,
          take: '50',
          search: productHandle.replace(/-/g, ' ') // Convert handle format to search terms
        });
        
        const handleUrl = `https://stamped.io/api/widget/reviews?${handleParams.toString()}`;
        const handleResponse = await this.makeRequest(handleUrl);
        
        if (handleResponse.data && Array.isArray(handleResponse.data) && handleResponse.data.length > 0) {
          console.log(`[StampedAPI] Found ${handleResponse.data.length} potential matches using handle search`);
          
          // Filter reviews to ensure they're actually related to this product
          const matchingReviews = handleResponse.data.filter((review: any) => 
            this.isReviewMatchingProduct(review, productTitle, productId, productHandle)
          );
          
          if (matchingReviews.length > 0) {
            console.log(`[StampedAPI] After filtering, found ${matchingReviews.length} reviews matching handle: ${productHandle}`);
            
            // Return the filtered results
            return {
              ...handleResponse,
              data: matchingReviews,
              total: matchingReviews.length,
              totalPages: Math.ceil(matchingReviews.length / 20),
              filtered: true,
              originalTotal: handleResponse.data.length
            };
          } else {
            console.log(`[StampedAPI] No reviews matched after filtering by handle: ${productHandle}`);
          }
        } else {
          console.log(`[StampedAPI] No reviews found using handle search: ${productHandle}`);
        }
      }
      
      // Step 2: Fall back to standard product ID search if handle search fails or isn't provided
      console.log(`[StampedAPI] Falling back to product ID search: ${cleanProductId}`);
      const params = new URLSearchParams({
        productId: cleanProductId,
        sId: STAMPED_CONFIG.storeHash,
        apiKey: STAMPED_CONFIG.publicKey,
        page: page.toString(),
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: '50',  // Get more reviews so we can filter
        sortReviews: 'recent'
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const response = await this.makeRequest(url);
      
      // Step 3: If no reviews found by product ID, try searching all reviews
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.log(`[StampedAPI] No reviews found by product ID, searching all reviews...`);
        
        // Get all store reviews
        const allReviewsParams = new URLSearchParams({
          sId: STAMPED_CONFIG.storeHash,
          apiKey: STAMPED_CONFIG.publicKey,
          page: '1',
          storeUrl: STAMPED_CONFIG.storeUrl,
          take: '100' // Get a larger batch to search through
        });
        
        const allReviewsUrl = `https://stamped.io/api/widget/reviews?${allReviewsParams.toString()}`;
        const allReviewsResponse = await this.makeRequest(allReviewsUrl);
        
        // Search through all reviews for content that might match our product
        // Look for product title or handle in review content
        console.log(`[StampedAPI] Searching through ${allReviewsResponse.data?.length || 0} reviews for matches...`);
        
        if (allReviewsResponse.data && Array.isArray(allReviewsResponse.data)) {
          const matchedReviews = allReviewsResponse.data.filter((review: any) => {
            // Check for product ID match
            if (review.productId && review.productId.toString() === cleanProductId) {
              return true;
            }
            
            // Check for product title match in review content
            if (productTitle && review.reviewMessage && 
                review.reviewMessage.toLowerCase().includes(productTitle.toLowerCase())) {
              return true;
            }
            
            // Check for handle match in review content
            if (productHandle && review.reviewMessage && 
                review.reviewMessage.toLowerCase().includes(productHandle.replace(/-/g, ' ').toLowerCase())) {
              return true;
            }
            
            // Check product name field
            if (productTitle && review.productName && 
                review.productName.toLowerCase().includes(productTitle.toLowerCase())) {
              return true;
            }
            
            return false;
          });
          
          if (matchedReviews.length > 0) {
            console.log(`[StampedAPI] Found ${matchedReviews.length} matching reviews in content search`);
            return {
              ...allReviewsResponse,
              data: matchedReviews,
              total: matchedReviews.length,
              totalPages: Math.ceil(matchedReviews.length / 20),
              filtered: true,
              originalTotal: allReviewsResponse.data.length
            };
          }
        }
      }
      
      // Step 4: At this point, just filter the original response (which might be empty)
      if ((productTitle || productHandle) && response.data && Array.isArray(response.data)) {
        console.log(`[StampedAPI] Filtering ${response.data.length} reviews for product: "${productTitle || productHandle}"`);
        
        // Filter reviews to match the product
        const matchingReviews = response.data.filter((review: any) => 
          this.isReviewMatchingProduct(review, productTitle, productId, productHandle)
        );
        
        console.log(`[StampedAPI] Found ${matchingReviews.length} matching reviews out of ${response.data.length} total`);
        
        // Add the product info to each review
        const enhancedReviews = matchingReviews.map((review: any) => {
          const { forProduct, extractedFrom } = this.extractProductInfo(review);
          return {
            ...review,
            matchedProduct: {
              title: forProduct,
              extractedFrom: extractedFrom
            }
          };
        });
        
        // Return the filtered results
        return {
          ...response,
          data: enhancedReviews,
          total: enhancedReviews.length,
          totalPages: Math.ceil(enhancedReviews.length / 20),
          filtered: true,
          originalTotal: response.data.length
        };
      }
      
      // If no filtering was done, return the original response
      return response;
    } catch (error) {
      console.error(`[StampedAPI] Get Reviews Error for product ${cleanProductId}:`, error);
      // Properly handle unknown error type
      return { 
        data: [], 
        total: 0,
        totalPages: 0,
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Get rating summary for a product
   */
  async getProductRatingSummary(productId: string) {
    const cleanProductId = this.sanitizeProductId(productId);
    
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
      });
    } catch (error) {
      console.error(`[StampedAPI] Get Rating Error for product ${cleanProductId}:`, error);
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
  async submitReview(reviewData: any) {
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
      
      // Add "For: ProductName" to the review message to make it easier to match later
      let reviewMessage = reviewData.reviewMessage;
      if (reviewData.productName && !reviewMessage.includes('For:')) {
        reviewMessage += `\n\nFor: ${reviewData.productName}`;
      }
      formData.append('reviewMessage', reviewMessage);
      
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
      return await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': this.basicAuthHeader
        },
        body: formData.toString()
      });
    } catch (error) {
      console.error(`[StampedAPI] Submit Review Error for product ${cleanProductId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  /**
   * Verify API connection by listing store information
   */
  async verifyConnection() {
    try {
      // Try to get some reviews as a connection test
      const params = new URLSearchParams({
        apiKey: STAMPED_CONFIG.publicKey,
        sId: STAMPED_CONFIG.storeHash,
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: '1'  // Only get 1 review to minimize data transfer
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const result = await this.makeRequest(url);
      
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
}