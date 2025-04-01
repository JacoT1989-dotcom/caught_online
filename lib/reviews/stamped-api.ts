// lib/reviews/stamped-api.ts
import { STAMPED_CONFIG } from "./config";

/**
 * A unified client for interacting with the Stamped.io API
 * Based on official Stamped.io API documentation
 */
export class StampedApiClient {
  private readonly basicAuthHeader: string;
  
  constructor() {
    // Create Basic Auth token as specified in the docs
    const username = STAMPED_CONFIG.publicKey;
    const password = STAMPED_CONFIG.privateKey;
    this.basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
  
  /**
   * Sanitize product ID for Stamped API
   */
  private sanitizeProductId(productId: string): string {
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
   * Makes a request to the Stamped API with proper error handling
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
    
    console.log(`Making request to: ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed (${response.status}): ${errorText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error making Stamped API request:', error);
      throw error;
    }
  }
  
  /**
   * Get reviews for a product using widget API (from official docs)
   */
  async getProductReviews(productId: string, page: number = 1) {
    try {
      // Sanitize the product ID
      const cleanProductId = this.sanitizeProductId(productId);
      
      const params = new URLSearchParams({
        productId: cleanProductId,
        sId: STAMPED_CONFIG.storeHash,
        apiKey: STAMPED_CONFIG.publicKey,
        page: page.toString(),
        storeUrl: STAMPED_CONFIG.storeUrl,
        take: '20', // Match the limit in the frontend
        sortReviews: 'recent'
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.log('Widget API failed:', error);
      throw error;
    }
  }
  
  /**
   * Get rating summary for a product using badges API (from official docs)
   */
  async getProductRatingSummary(productId: string) {
    try {
      // Sanitize the product ID
      const cleanProductId = this.sanitizeProductId(productId);
      
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
      console.error('Failed to get rating summary:', error);
      throw error;
    }
  }
  
  /**
   * Submit a review using the reviews3 endpoint (from official docs)
   */
  async submitReview(reviewData: any) {
    try {
      // Sanitize the product ID if present
      const cleanProductId = reviewData.productId 
        ? this.sanitizeProductId(reviewData.productId) 
        : '';
      
      // Create form data based on documentation
      const formData = new URLSearchParams();
      
      // Add required fields from the documentation
      formData.append('productId', cleanProductId);
      formData.append('author', reviewData.author);
      formData.append('email', reviewData.email);
      formData.append('reviewRating', reviewData.reviewRating.toString());
      formData.append('reviewTitle', reviewData.reviewTitle);
      formData.append('reviewMessage', reviewData.reviewMessage);
      formData.append('reviewRecommendProduct', reviewData.reviewRecommendProduct ? 'true' : 'false');
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
      console.error('Failed to submit review:', error);
      throw error;
    }
  }
  
  /**
   * Skipping auth/check endpoint since it's not working correctly and going directly
   * to a simple review check to verify API connection
   */
  async verifyConnection() {
    try {
      // Instead of auth/check, use the widget reviews endpoint as a test
      const params = new URLSearchParams({
        apiKey: STAMPED_CONFIG.publicKey,
        sId: STAMPED_CONFIG.storeHash,
        storeUrl: STAMPED_CONFIG.storeUrl
      });
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const result = await this.makeRequest(url);
      return { success: true, data: result };
    } catch (error) {
      console.error('Connection verification failed:', error);
      return { success: false, error };
    }
  }
}