// app/api/reviews/get-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/enhanced-stamped-client';

/**
 * API route for fetching reviews from Stamped.io
 */
export async function GET(req: NextRequest) {
  try {
    // Parse search parameters
    const searchParams = req.nextUrl.searchParams;
    
    // Extract parameters
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate required parameters
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching reviews for product ${productId}`);
    console.log(`[API] Page: ${page}, Limit: ${limit}`);
    
    // Initialize Stamped client
    const stampedClient = new StampedApiClient();
    
    // Fetch reviews
    const reviewsResponse = await stampedClient.getProductReviews(
      productId, 
      page, 
      limit
    );
    
    // Return the reviews with metadata
    return NextResponse.json({
      reviews: reviewsResponse.reviews,
      count: reviewsResponse.total,
      totalPages: reviewsResponse.totalPages,
      currentPage: page,
      source: 'stamped_widget_api'
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

// Mark this route as dynamic
export const dynamic = 'force-dynamic';