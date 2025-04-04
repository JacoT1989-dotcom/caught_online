// app/api/reviews/get-rating-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/stamped-api';

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
        { success: false, error: 'Missing productId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching rating summary for product ${productId}`);
    
    // Initialize Stamped client
    const stampedClient = new StampedApiClient();
    
    // Verify connection first
    const connectionStatus = await stampedClient.verifyConnection();
    if (!connectionStatus.success) {
      console.error('Stamped API connection failed:', connectionStatus.error);
      return NextResponse.json({
        success: true,
        rating: 0,
        total: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      });
    }
    
    // Get rating summary - using POST method according to docs
    const summaryData = await stampedClient.getProductRatingSummary(productId);
    
    // If no data was found or response is empty
    if (!summaryData || !Array.isArray(summaryData) || summaryData.length === 0) {
      return NextResponse.json({
        success: true,
        rating: 0,
        total: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      });
    }
    
    // Process the data - based on the Stamped badges API response format
    const product = summaryData[0];
    
    // Build rating distribution from the breakdown object
    const distribution = {
      5: product.breakdown?.rating5 || 0,
      4: product.breakdown?.rating4 || 0,
      3: product.breakdown?.rating3 || 0,
      2: product.breakdown?.rating2 || 0,
      1: product.breakdown?.rating1 || 0
    };
    
    return NextResponse.json({
      success: true,
      rating: product.rating || 0,
      total: product.count || 0,
      distribution
    });
    
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch rating summary',
      details: error instanceof Error ? error.message : 'Unknown error',
      rating: 0,
      total: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    }, { status: 500 });
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';