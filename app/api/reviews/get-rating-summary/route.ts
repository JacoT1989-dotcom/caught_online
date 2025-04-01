// app/api/reviews/get-rating-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/enhanced-stamped-client';

/**
 * API route for fetching product rating summary from Stamped.io
 */
export async function GET(req: NextRequest) {
  try {
    // Parse search parameters
    const searchParams = req.nextUrl.searchParams;
    
    // Extract product identification parameters
    const productId = searchParams.get('productId');
    
    // Validate required parameters
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching rating summary for product ${productId}`);
    
    // Initialize Stamped client
    const stampedClient = new StampedApiClient();
    
    // Get rating summary
    const ratingSummary = await stampedClient.getProductRatingSummary(productId);
    
    // Return the rating summary
    return NextResponse.json(ratingSummary);
    
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch rating summary',
        details: error instanceof Error ? error.message : 'Unknown error',
        rating: 0,
        total: 0
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';