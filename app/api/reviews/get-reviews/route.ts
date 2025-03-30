// app/api/reviews/get-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';
import { getStampedId, findAllRelevantStampedIds } from '@/lib/reviews/enhanced-product-middleware';

// Define an interface for the review object
interface StampedReview {
  id: string;
  productId: string;
  published: boolean;
  product?: {
    id: string;
    title?: string;
  };
  // Add other properties that you access in your code
  productTitle?: string;
  reviewTitle?: string;
  title?: string;
  reviewMessage?: string;
  body?: string;
  content?: string;
  rating: number;
  authorName?: string;
  author?: string;
  createdAt?: string;
  created_at?: string;
  verified?: boolean;
}

/**
 * API route for fetching reviews for a specific product
 * Handles product ID mapping and API error fallbacks
 */
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const title = searchParams.get('title');
    const handle = searchParams.get('handle');
    
    // Validate required parameters
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching reviews using dashboard API`);
    console.log(`[API] Search criteria: ID=${productId}, Handle=${handle}, Title=${title}`);
    
    // Find potential Stamped IDs for this product using our middleware
    const stampedIds = findAllRelevantStampedIds(productId, title || undefined, handle || undefined);
    console.log(`[API] Looking for reviews with these potential Stamped IDs: ${stampedIds.join(', ')}`);
    
    // Initialize the Stamped client
    const stampedClient = new EnhancedStampedClient();
    
    // Try to fetch all store reviews first (with product filtering on our side)
    // This gives us more control and better data consistency
    const allReviews = await stampedClient.getAllStoreReviews(10000);  // High limit to get all reviews
    
    console.log(`[API] Received ${allReviews.results?.length || 0} total reviews from dashboard API`);
    
    // Filter reviews to those matching our product IDs
    // The Widget API only includes published reviews, so this also ensures we only get published reviews
    const filteredReviews = Array.isArray(allReviews.results) 
      ? allReviews.results.filter((review: StampedReview) => {
          // Only include published reviews
          if (review.published !== true) {
            return false;
          }
          
          // Check if the review is for any of our potential product IDs
          return stampedIds.some((id: string) => 
            review.productId === id || 
            (review.product && review.product.id === id)
          );
        })
      : [];
    
    console.log(`[API] Filtered to ${filteredReviews.length} reviews for product`);
    
    // If we didn't get any reviews, try the direct product reviews endpoint as a fallback
    if (filteredReviews.length === 0 && !allReviews._error) {
      // Try each potential ID until we find reviews
      for (const stampedId of stampedIds) {
        try {
          console.log(`[API] Trying direct product reviews API for ID: ${stampedId}`);
          const directReviews = await stampedClient.getProductReviews(stampedId);
          
          if (directReviews.reviews && directReviews.reviews.length > 0) {
            console.log(`[API] Found ${directReviews.reviews.length} reviews using direct API`);
            
            // Transform to match the format expected by the frontend
            const transformedReviews = directReviews.reviews.map((review: any) => ({
              id: review.id,
              productId: review.productId,
              productTitle: review.productTitle,
              reviewTitle: review.title,
              reviewMessage: review.content,
              rating: review.rating,
              authorName: review.authorName,
              createdAt: review.createdAt,
              published: true, // Widget API only returns published reviews
              verified: review.verified || false
            }));
            
            return NextResponse.json({
              reviews: transformedReviews,
              count: transformedReviews.length,
              source: 'widget_api'
            });
          }
        } catch (error) {
          console.error(`[API] Error fetching direct reviews for ID ${stampedId}:`, error);
          // Continue to the next ID
        }
      }
    }
    
    // Prepare reviews in a consistent format
    const formattedReviews = filteredReviews.map((review: StampedReview) => ({
      id: review.id,
      productId: review.productId,
      productTitle: review.productTitle || (review.product?.title || ''),
      reviewTitle: review.reviewTitle || review.title || '',
      reviewMessage: review.reviewMessage || review.body || review.content || '',
      rating: review.rating,
      authorName: review.authorName || review.author || '',
      author: review.authorName || review.author || '',
      createdAt: review.createdAt || review.created_at || '',
      published: true, // We're only returning published reviews
      verified: review.verified || false
    }));
    
    // Return the filtered reviews
    return NextResponse.json({
      reviews: formattedReviews,
      count: formattedReviews.length,
      source: allReviews._fromWidgetApi ? 'widget_api' : 'dashboard_api'
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error',
        reviews: []
      },
      { status: 500 }
    );
  }
}