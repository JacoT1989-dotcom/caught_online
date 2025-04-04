// app/api/reviews/get-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/stamped-api';

/**
 * API route for fetching reviews from Stamped.io
 */
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching reviews for product ${productId}, page ${page}`);
    
    // Initialize Stamped API client
    const stamped = new StampedApiClient();
    
    // Verify connection first
    const connectionStatus = await stamped.verifyConnection();
    if (!connectionStatus.success) {
      console.error('Stamped API connection failed:', connectionStatus.error);
      return NextResponse.json({
        success: true,
        reviews: [],
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: 1,
          totalReviews: 0,
          perPage: parseInt(limit, 10)
        }
      });
    }
    
    // Fetch reviews
    const reviewsData = await stamped.getProductReviews(productId, parseInt(page, 10));
    
    // Process pagination data
    const totalReviews = reviewsData.totalReviews || reviewsData.data?.length || 0;
    const totalPages = reviewsData.totalPages || Math.ceil(totalReviews / parseInt(limit, 10)) || 1;
    
    // Map the reviews data to match our frontend component expectations
    const reviews = (reviewsData.data || []).map((review: any) => ({
      id: review.id,
      rating: review.reviewRating,
      reviewTitle: review.reviewTitle,
      reviewMessage: review.reviewMessage,
      createdAt: review.dateCreated || review.reviewDate,
      verified: review.reviewVerifiedType === 2, // Assuming 2 means verified
      author: review.author,
      authorName: review.author,
      // Process images if available
      images: review.reviewUserPhotos ? 
        review.reviewUserPhotos.split(',').map((url: string) => ({
          url: url,
          thumbnail: url
        })) : []
    }));
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalReviews,
        perPage: parseInt(limit, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      reviews: []
    }, { status: 500 });
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';