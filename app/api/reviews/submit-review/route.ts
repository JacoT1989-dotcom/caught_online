// app/api/reviews/submit-review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/stamped-api';

/**
 * API route for submitting a review to Stamped.io
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body instead of form data
    const body = await req.json();
    
    // Extract review data
    const {
      productId,
      rating,
      title,
      content,
      name,
      email,
      isRecommended = true,
      productName = '',
      productUrl = '',
      location = 'South Africa'
    } = body;
    
    // Validate required fields
    if (!productId || !rating || !title || !content || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Submitting review for product ${productId} by ${name}`);
    
    // Initialize Stamped client
    const stampedClient = new StampedApiClient();
    
    // Prepare review data for Stamped API
    const reviewData = {
      productId,
      author: name,
      email,
      reviewRating: rating,
      reviewTitle: title,
      reviewMessage: content,
      reviewRecommendProduct: isRecommended,
      productName,
      productUrl,
      location
    };
    
    // Submit the review
    const result = await stampedClient.submitReview(reviewData);
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: result.id || null
    });
    
  } catch (error) {
    console.error('Error submitting review:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';