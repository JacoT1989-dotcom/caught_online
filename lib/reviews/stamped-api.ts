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
    if (options.body) {
      console.log(`Request body: ${options.body}`);
    }
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed (${response.status}): ${errorText}`);
        console.error('Request URL:', url);
        console.error('Store Hash:', STAMPED_CONFIG.storeHash);
        console.error('Store URL:', STAMPED_CONFIG.storeUrl);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // For empty responses, return a success indicator
      if (response.headers.get('content-length') === '0') {
        return { success: true };
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
      
      const params = new URLSearchParams();
      params.append('productId', cleanProductId);
      params.append('page', page.toString());
      params.append('take', '20'); // Match the limit in the frontend
      params.append('sortReviews', 'recent');
      
      // Only append these if they exist
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeUrl) params.append('storeUrl', STAMPED_CONFIG.storeUrl);
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Widget API failed:', error);
      throw error;
    }
  }
  
  /**
   * Get rating summary for a product using calculated approach from reviews
   * (Since the badges API is consistently failing)
   */
  async getProductRatingSummary(productId: string) {
    try {
      // For now, skip the badges API attempt since it's consistently failing
      // Just use the reviews endpoint to calculate ratings
      console.log('Calculating rating summary from reviews');
      const reviewsData = await this.getProductReviews(productId, 1);
      
      // Calculate average rating and distribution
      let totalRating = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      if (reviewsData.data && Array.isArray(reviewsData.data)) {
        reviewsData.data.forEach((review: any) => {
          const rating = review.reviewRating || 0;
          totalRating += rating;
          
          // Increment the appropriate rating category
          const ratingCategory = Math.round(rating) as 1 | 2 | 3 | 4 | 5;
          if (ratingCategory >= 1 && ratingCategory <= 5) {
            distribution[ratingCategory]++;
          }
        });
      }
      
      const count = reviewsData.data?.length || 0;
      const avgRating = count > 0 ? totalRating / count : 0;
      
      return [{
        productId,
        rating: avgRating,
        count: count,
        breakdown: {
          rating5: distribution[5],
          rating4: distribution[4],
          rating3: distribution[3],
          rating2: distribution[2],
          rating1: distribution[1]
        }
      }];
    } catch (error) {
      console.error('Failed to get rating summary:', error);
      
      // Return a default empty response if everything fails
      return [{
        productId,
        rating: 0,
        count: 0,
        breakdown: {
          rating5: 0,
          rating4: 0,
          rating3: 0,
          rating2: 0,
          rating1: 0
        }
      }];
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
      
      // Essential fields for proper product association
      if (reviewData.productSKU) formData.append('productSKU', reviewData.productSKU);
      if (reviewData.productUrl) formData.append('productUrl', reviewData.productUrl);
      if (reviewData.location) formData.append('location', reviewData.location);
      
      // Add product handle for proper identification in Stamped's system
      if (reviewData.productHandle) {
        formData.append('productHandle', reviewData.productHandle);
        // Also add as product type to ensure it's linked properly
        formData.append('productType', reviewData.productHandle);
      }
      
      formData.append('reviewSource', 'api');
      
      // Add shop information to ensure Stamped knows which shop the review belongs to
      formData.append('storeUrl', STAMPED_CONFIG.storeUrl);
      if (STAMPED_CONFIG.storeHash) {
        formData.append('sId', STAMPED_CONFIG.storeHash);
      }
      
      const params = new URLSearchParams();
      // Only append these if they exist
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      
      const url = `https://stamped.io/api/reviews3?${params.toString()}`;
      
      // Determine if we need to handle photos
      if (reviewData.photos && Array.isArray(reviewData.photos) && reviewData.photos.length > 0) {
        // We need to use a multipart form approach
        const multipartForm = new FormData();
        
        // Add all the fields
        for (const [key, value] of formData.entries()) {
          multipartForm.append(key, value);
        }
        
        // Add photos
        reviewData.photos.forEach((photo: File, index: number) => {
          multipartForm.append(`photo${index}`, photo);
        });
        
        // Make a special multipart form request
        return await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': this.basicAuthHeader
          },
          body: multipartForm
        }).then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed (${response.status}): ${errorText}`);
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          // For empty responses, return a success indicator
          if (response.headers.get('content-length') === '0') {
            return { success: true, id: Date.now().toString() };
          }
          
          return await response.json();
        });
      } else {
        // Regular form submission without photos
        const result = await this.makeRequest(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': this.basicAuthHeader
          },
          body: formData.toString()
        });
        
        return result.success ? { ...result, id: Date.now().toString() } : result;
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }
  
  /**
   * Verify connection to Stamped.io API
   */
  async verifyConnection() {
    try {
      // Test connection with simple API call
      const params = new URLSearchParams();
      // Only append these if they exist
      if (STAMPED_CONFIG.publicKey) params.append('apiKey', STAMPED_CONFIG.publicKey);
      if (STAMPED_CONFIG.storeHash) params.append('sId', STAMPED_CONFIG.storeHash);
      if (STAMPED_CONFIG.storeUrl) params.append('storeUrl', STAMPED_CONFIG.storeUrl);
      
      const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
      const result = await this.makeRequest(url);
      return { success: true, data: result };
    } catch (error) {
      console.error('Connection verification failed:', error);
      return { success: false, error };
    }
  }
}