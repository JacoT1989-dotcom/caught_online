// lib/reviews/enhanced-stamped-client.ts
import { STAMPED_CONFIG } from "./config";

// Define interfaces for type safety
export interface StampedReview {
  id: string;
  productId: string;
  productTitle?: string;
  rating: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  verified?: boolean;
}

export interface StampedRatingSummary {
  productIds?: Array<{
    averageRating?: number;
    totalReviews?: number;
    ratingDistribution?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }>;
}

export interface ReviewResponse {
  reviews?: StampedReview[];
  total?: number;
  count?: number;
}

export class StampedApiClient {
  private readonly basicAuthHeader: string;
  
  constructor() {
    // Create Basic Auth token
    const username = STAMPED_CONFIG.publicKey;
    const password = STAMPED_CONFIG.privateKey;
    this.basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  /**
   * Makes a request to the Stamped API with comprehensive error handling
   */
  private async makeRequest(
    url: string, 
    options: RequestInit = {}, 
    retries = 3
  ): Promise<any> {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.basicAuthHeader,
        ...(options.headers || {})
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    };
    
    console.log(`[StampedAPI] Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[StampedAPI] Error: ${response.status} ${response.statusText}`);
        console.error(`[StampedAPI] Full Response: ${errorText}`);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        console.log(`[StampedAPI] Retrying request. Attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.makeRequest(url, options, retries - 1);
      }
      
      console.error(`[StampedAPI] Request Error:`, error);
      throw error;
    }
  }

  /**
   * Sanitize product ID for Stamped API
   */
  private sanitizeProductId(productId: string): string {
    // If it's a Shopify GID (gid://shopify/Product/1234567890)
    const gidMatch = productId.match(/\/Product\/(\d+)/);
    if (gidMatch) return gidMatch[1];
    
    // Remove any non-numeric characters
    return productId.replace(/\D/g, '');
  }

  /**
   * Get reviews for a product using multiple API strategies
   */
  async getProductReviews(
    productId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    reviews: StampedReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const strategies = [
      // Widget API
      async () => {
        try {
          const cleanProductId = this.sanitizeProductId(productId);
          
          const params = new URLSearchParams({
            productId: cleanProductId,
            sId: STAMPED_CONFIG.storeHash,
            apiKey: STAMPED_CONFIG.publicKey,
            page: page.toString(),
            storeUrl: STAMPED_CONFIG.storeUrl,
            take: limit.toString(),
            sortReviews: 'recent'
          });
          
          const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
          const response: ReviewResponse = await this.makeRequest(url);
          
          return {
            reviews: (response.reviews || []).map(review => ({
              id: review.id,
              productId: review.productId,
              productTitle: review.productTitle,
              rating: review.rating,
              title: review.title,
              content: review.content,
              authorName: review.authorName,
              createdAt: review.createdAt,
              verified: review.verified || false
            })),
            total: response.total || 0,
            page: page,
            totalPages: Math.ceil((response.total || 0) / limit)
          };
        } catch (error) {
          console.error('[StampedAPI] Widget API review fetch failed:', error);
          throw error;
        }
      },
      
      // Dashboard API fallback
      async () => {
        try {
          const cleanProductId = this.sanitizeProductId(productId);
          
          const url = `https://stamped.io/api/v2/${STAMPED_CONFIG.storeHash}/dashboard/reviews/`;
          
          const params = new URLSearchParams({
            productIds: cleanProductId,
            page: page.toString(),
            limit: limit.toString()
          });
          
          const response = await this.makeRequest(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': this.basicAuthHeader
            }
          });
          
          return {
            reviews: (response.results || []).map((reviewData: any) => ({
              id: reviewData.review.id,
              productId: reviewData.review.productId,
              productTitle: reviewData.review.productTitle,
              rating: reviewData.review.rating,
              title: reviewData.review.title,
              content: reviewData.review.body,
              authorName: reviewData.review.author,
              createdAt: reviewData.review.dateCreated,
              verified: reviewData.review.verifiedType === 2
            })),
            total: response.total || 0,
            page: page,
            totalPages: response.totalPages || Math.ceil((response.total || 0) / limit)
          };
        } catch (error) {
          console.error('[StampedAPI] Dashboard API review fetch failed:', error);
          throw error;
        }
      }
    ];
    
    // Try strategies sequentially
    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result.reviews.length > 0) {
          return result;
        }
      } catch (error) {
        console.error('[StampedAPI] Review fetch strategy failed:', error);
      }
    }
    
    // If all strategies fail
    return {
      reviews: [],
      total: 0,
      page: page,
      totalPages: 0
    };
  }

  /**
   * Get rating summary for a product
   */
  async getProductRatingSummary(productId: string): Promise<{
    rating: number;
    total: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }> {
    const strategies = [
      // Widget Badges API
      async () => {
        try {
          const cleanProductId = this.sanitizeProductId(productId);
          
          const bodyData = {
            productIds: [{ productId: cleanProductId }],
            apiKey: STAMPED_CONFIG.publicKey,
            storeUrl: STAMPED_CONFIG.storeUrl
          };
          
          const url = 'https://stamped.io/api/widget/badges?isIncludeBreakdown=true';
          const response = await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(bodyData)
          });
          
          const firstProduct = response[0] || {};
          
          return {
            rating: firstProduct.rating || 0,
            total: firstProduct.count || 0,
            distribution: firstProduct.breakdown || {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0
            }
          };
        } catch (error) {
          console.error('[StampedAPI] Widget Badges API failed:', error);
          throw error;
        }
      },
      
      // Fallback Dashboard API
      async () => {
        try {
          const cleanProductId = this.sanitizeProductId(productId);
          
          const url = `https://s2.stamped.io/api/v2/${STAMPED_CONFIG.storeHash}/dashboard/reviews/`;
          
          const params = new URLSearchParams({
            productIds: cleanProductId
          });
          
          const response = await this.makeRequest(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': this.basicAuthHeader
            }
          });
          
          // Assuming first review represents the summary
          const firstReview = response.results?.[0]?.review;
          
          return {
            rating: firstReview?.rating || 0,
            total: response.total || 0,
            distribution: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0
            }
          };
        } catch (error) {
          console.error('[StampedAPI] Dashboard API rating summary failed:', error);
          throw error;
        }
      }
    ];
    
    // Try strategies sequentially
    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result.total > 0) {
          return result;
        }
      } catch (error) {
        console.error('[StampedAPI] Rating summary strategy failed:', error);
      }
    }
    
    // If all strategies fail
    return { 
      rating: 0, 
      total: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
  }
}

// Create and export a default instance of the client
export const StampedClient = new StampedApiClient();