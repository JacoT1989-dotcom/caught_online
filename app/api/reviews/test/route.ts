// app/api/reviews/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-api';

/**
 * Test endpoint to verify access to Stamped.io dashboard API
 * This will help confirm if we can see all reviews in the store
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing access to Stamped.io dashboard API');
    
    const client = new EnhancedStampedClient();
    const result = await client.getAllStoreReviews(20);
    
    console.log(`[API] Dashboard API response received, found ${result.results?.length || 0} reviews`);
    
    // If we got results, log the first one for debugging
    if (result.results && result.results.length > 0) {
      const firstReview = result.results[0].review;
      console.log(`[API] First review: ID=${firstReview.id}, Product=${firstReview.productTitle}, Rating=${firstReview.rating}`);
    }
    
    return NextResponse.json({
      success: true,
      reviewCount: result.results?.length || 0,
      firstReview: result.results?.[0] || null,
      rawResponse: result
    });
  } catch (error) {
    console.error('[API] Error testing Stamped dashboard API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}