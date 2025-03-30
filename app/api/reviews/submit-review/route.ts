// app/api/reviews/submit-review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';
import { getStampedId } from '@/lib/reviews/enhanced-product-middleware';

/**
 * API route for submitting a review to Stamped.io
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await req.formData();
    
    // Extract review data
    const productId = formData.get('productId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const isRecommended = formData.get('isRecommended') === 'true';
    
    // Validate required fields
    if (!productId || !rating || !title || !content || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Submitting review for product ${productId} by ${name}`);
    
    // Get Stamped ID for the product
    const stampedIds = getStampedId(productId);
    const stampedId = stampedIds[0]; // Use the first match
    
    // Extract any images
    const images: File[] = [];
    for (let i = 0; i < 10; i++) { // Limit to 10 images
      const imageKey = `image_${i}`;
      const image = formData.get(imageKey) as File;
      if (image && image.size > 0) {
        images.push(image);
      }
    }
    
    // Initialize Stamped client
    const stampedClient = new EnhancedStampedClient();
    
    // Prepare review data for Stamped API
    const reviewData = {
      productId: stampedId,
      author: name,
      email: email,
      reviewRating: rating,
      reviewTitle: title,
      reviewMessage: content,
      reviewRecommendProduct: isRecommended,
      productName: formData.get('productName') as string || '',
      productUrl: formData.get('productUrl') as string || '',
      location: formData.get('location') as string || 'South Africa',
    };
    
    // Submit the review
    const result = await stampedClient.submitReview(reviewData);
    
    // Handle image uploads if the review was submitted successfully
    // Note: Image upload is not implemented in the current client
    // This would need additional implementation
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully',
        reviewId: result.reviewId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to submit review' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}