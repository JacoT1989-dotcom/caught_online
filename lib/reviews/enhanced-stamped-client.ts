// lib/reviews/enhanced-stamped-api.ts
import { STAMPED_CONFIG } from "./config";
import { CSVImportRow } from "./enhanced-product-middleware";

/**
 * An enhanced client for interacting with the Stamped.io API
 * With improved error handling and debugging
 */
export class EnhancedStampedClient {
  importReviewsFromCSV(preparedData: CSVImportRow[]) {
    throw new Error('Method not implemented.');
  }
  private readonly basicAuthHeader: string;
  
  constructor() {
    // Create Basic Auth token as specified by Stamped dev team
    const username = STAMPED_CONFIG.publicKey || '';
    const password = STAMPED_CONFIG.privateKey || '';
    this.basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
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
        return idMatch[1];
      }
    }
    
    // If it contains slashes but isn't a gid format, take the last part
    if (productId.includes('/') && !productId.includes('gid://')) {
      const parts = productId.split('/');
      const cleanId = parts[parts.length - 1];
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
    
    try {
      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      // Try to parse as JSON
      try {
        return responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        return { raw: responseText };
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get reviews for a product using widget API
   */
  async getProductReviews(productId: string, page: number = 1) {
    const cleanProductId = this.sanitizeProductId(productId);
    
    try {
      const params = new URLSearchParams();
      params.append('productId', cleanProductId);
      params.append('page', page.toString());
      params.append('take', '10');
      params.append('sortReviews', 'recent');
      
      // Only append these if they exist
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeUrl) params.append('storeUrl', STAMPED_CONFIG.storeUrl);
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      return await this.makeRequest(url);
    } catch (error) {
      return { 
        reviews: [], 
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
      formData.append('reviewMessage', reviewData.reviewMessage);
      formData.append('reviewRecommendProduct', 'true');
      formData.append('productName', reviewData.productName || '');
      
      if (reviewData.productSKU) formData.append('productSKU', reviewData.productSKU);
      if (reviewData.productUrl) formData.append('productUrl', reviewData.productUrl);
      if (reviewData.location) formData.append('location', reviewData.location);
      
      formData.append('reviewSource', 'api');
      
      const params = new URLSearchParams();
      
      // Only append these if they exist
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      
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
  async getAllStoreReviews(limit: number = 20) {
    try {
      const url = `https://stamped.io/api/v2/${STAMPED_CONFIG.storeHash}/dashboard/reviews?limit=${limit}`;
      
      return await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.basicAuthHeader
        }
      });
    } catch (error) {
      return { 
        results: [], 
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
      const params = new URLSearchParams();
      
      // Only append these if they exist
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      if (STAMPED_CONFIG.storeUrl) params.append('storeUrl', STAMPED_CONFIG.storeUrl);
      
      params.append('take', '1');  // Only get 1 review to minimize data transfer
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const result = await this.makeRequest(url);
      
      return { 
        success: true, 
        data: result,
        message: `Successfully connected to Stamped API for store ${STAMPED_CONFIG.storeHash}`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to connect to Stamped API. Check your credentials and network connection.'
      };
    }
  }
  
  /**
   * Get all stores associated with this API key
   * This can be useful for verifying your storeHash is correct
   */
  async listStores() {
    try {
      const url = 'https://stamped.io/api/storeList';
      
      return await this.makeRequest(url, {
        method: 'GET'
      });
    } catch (error) {
      return { 
        stores: [], 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
}