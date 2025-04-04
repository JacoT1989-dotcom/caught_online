// lib/reviews/stamped.ts
import { STAMPED_CONFIG } from './config';

// Define the Review type that your component expects
export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  dateCreated: string;
  author: {
    name: string;
  };
  isVerifiedBuyer: boolean;
  images?: {
    url: string;
    thumbnail: string;
  }[];
}

// Define the RatingSummary type that your component expects
export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

// Define the ReviewSubmission type
export interface ReviewSubmission {
  productId: string;
  rating: number;
  title: string;
  content: string;
  name: string;
  email: string;
  isRecommended?: boolean;
  images?: File[];
}

// Define the result of a review submission
export interface ReviewSubmissionResult {
  success: boolean;
  message: string;
  review?: Review;
}

/**
 * Get rating summary for a product from Stamped.io
 * @param productId The Shopify product ID
 * @returns RatingSummary object with rating data
 */
export async function getProductRatingSummary(productId: string): Promise<RatingSummary> {
  try {
    // Call our API endpoint
    const response = await fetch(`/api/reviews/get-rating-summary?productId=${encodeURIComponent(productId)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching rating summary: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch rating summary');
    }
    
    // Transform the API response to match what the component expects
    return {
      averageRating: data.rating || 0,
      totalReviews: data.total || 0,
      ratingDistribution: data.distribution || {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
  } catch (error) {
    console.error('Error fetching product rating:', error);
    
    // Return default values on error
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
  }
}

/**
 * Get reviews for a product from Stamped.io
 * @param productId The Shopify product ID
 * @param page Page number for pagination, defaults to 1
 * @returns Array of Review objects
 */
export async function getProductReviews(productId: string, page: number = 1): Promise<Review[]> {
  try {
    // Call our API endpoint with pagination
    const response = await fetch(`/api/reviews/get-reviews?productId=${encodeURIComponent(productId)}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching reviews: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch reviews');
    }
    
    // Check if reviews exist in the response
    if (!data.reviews || !Array.isArray(data.reviews)) {
      return [];
    }
    
    // Transform the API response to match what the component expects
    return data.reviews.map((review: any) => ({
      id: review.id || `review-${Math.random().toString(36).substring(2, 11)}`,
      rating: review.rating || review.reviewRating || 0,
      title: review.reviewTitle || review.title || 'Review',
      content: review.reviewMessage || review.content || '',
      dateCreated: review.createdAt || review.dateCreated || new Date().toISOString(),
      author: {
        name: review.authorName || review.author || 'Anonymous'
      },
      isVerifiedBuyer: review.verified || false,
      images: review.images || []
    }));
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
}

/**
 * Submit a product review to Stamped.io
 * @param reviewData The review data to submit
 * @returns Success status and message
 */
export async function submitProductReview(reviewData: ReviewSubmission): Promise<ReviewSubmissionResult> {
  try {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add review data to FormData
    formData.append('productId', reviewData.productId);
    formData.append('rating', reviewData.rating.toString());
    formData.append('title', reviewData.title);
    formData.append('content', reviewData.content);
    formData.append('name', reviewData.name);
    formData.append('email', reviewData.email);
    
    if (reviewData.isRecommended !== undefined) {
      formData.append('isRecommended', reviewData.isRecommended.toString());
    }
    
    // Add images if any
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
    }
    
    // Call the API endpoint to submit the review
    const response = await fetch('/api/reviews/submit-review', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit review');
    }
    
    return {
      success: true,
      message: data.message || 'Review submitted successfully',
      review: data.review
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}