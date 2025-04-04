// app/api/reviews/submit-review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/stamped-api';

/**
 * API route for submitting a review to Stamped.io
 * Supports both JSON and FormData requests
 */
export async function POST(req: NextRequest) {
  try {
    let reviewData: any = {};
    
    // Check if content type is multipart form data
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Parse form data
      const formData = await req.formData();
      
      reviewData = {
        productId: formData.get('productId'),
        author: formData.get('name'),
        email: formData.get('email'),
        reviewRating: parseInt(formData.get('rating') as string, 10),
        reviewTitle: formData.get('title'),
        reviewMessage: formData.get('content'),
        reviewRecommendProduct: formData.get('isRecommended') === 'true',
        productName: formData.get('productName') || '',
        productUrl: formData.get('productUrl') || '',
        productHandle: formData.get('productHandle') || '',
        location: formData.get('location') || 'South Africa'
      };
      
      // Handle images if any
      const images: File[] = [];
      for (let i = 0; i < 5; i++) {
        // Check both image_i and photo formats
        const image = formData.get(`image_${i}`) as File || formData.get(`photo${i}`) as File;
        if (image && image.size > 0) {
          images.push(image);
        }
      }
      
      if (images.length > 0) {
        reviewData.photos = images;
      }
    } else {
      // Parse JSON
      const body = await req.json();
      
      reviewData = {
        productId: body.productId,
        author: body.name,
        email: body.email,
        reviewRating: body.rating,
        reviewTitle: body.title,
        reviewMessage: body.content,
        reviewRecommendProduct: body.isRecommended !== undefined ? body.isRecommended : true,
        productName: body.productName || '',
        productUrl: body.productUrl || '',
        productHandle: body.productHandle || '',
        location: body.location || 'South Africa'
      };
    }
    
    // Validate required fields
    if (!reviewData.productId || !reviewData.author || !reviewData.email || 
        !reviewData.reviewRating || !reviewData.reviewTitle || !reviewData.reviewMessage) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }
    
    console.log(`[API] Submitting review for product ${reviewData.productId} by ${reviewData.author}`);
    console.log(`Product handle: ${reviewData.productHandle}, Product name: ${reviewData.productName}`);
    
    // Initialize Stamped client
    const stampedClient = new StampedApiClient();
    
    // Verify connection first
    const connectionStatus = await stampedClient.verifyConnection();
    if (!connectionStatus.success) {
      console.error('Stamped API connection failed:', connectionStatus.error);
      return NextResponse.json({
        success: false,
        error: 'Connection to review service failed'
      }, { status: 500 });
    }
    
    // Submit the review
    const result = await stampedClient.submitReview(reviewData);
    
    // Create a properly formatted review response for the frontend
    const reviewResponse = {
      id: result.id || `review-${Date.now()}`,
      rating: reviewData.reviewRating,
      title: reviewData.reviewTitle,
      content: reviewData.reviewMessage,
      dateCreated: new Date().toISOString(),
      author: {
        name: reviewData.author
      },
      isVerifiedBuyer: false // New reviews aren't verified yet
    };
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: result.id || null,
      review: reviewResponse
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