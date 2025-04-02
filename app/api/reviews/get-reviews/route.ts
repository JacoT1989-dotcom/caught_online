// app/api/reviews/get-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ShopifyStampedIntegration } from '@/lib/reviews/shopify-stamped-integration';
import { getProduct } from '@/lib/shopify/products'; 
import { STAMPED_CONFIG } from "@/lib/reviews/config";

/**
 * Fetch reviews using the widget API with direct search
 * This is confirmed to work with Stamped.io as per their support
 */
async function searchProductReviews(searchTerm: string, pageNum: number = 1, takeNum: number = 100) {
  try {
    console.log(`[StampedAPI] Searching for reviews with term: "${searchTerm}"`);
    
    // Build search parameters according to Stamped.io documentation
    const params = new URLSearchParams({
      sId: STAMPED_CONFIG.storeHash,
      apiKey: STAMPED_CONFIG.publicKey,
      storeUrl: STAMPED_CONFIG.storeUrl,
      take: takeNum.toString(),
      page: pageNum.toString(),
      search: searchTerm  // This is the key for text search
    });
    
    const url = `https://stamped.io/api/widget/reviews?${params.toString()}`;
    console.log(`[StampedAPI] Search request URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[StampedAPI] Error response: ${response.status}`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[StampedAPI] Found ${data.data?.length || 0} reviews matching "${searchTerm}"`);
    
    return data;
  } catch (error) {
    console.error('[StampedAPI] Error searching for reviews:', error);
    throw error;
  }
}

/**
 * API route for fetching reviews from Stamped.io with improved Shopify integration
 */
export async function GET(req: NextRequest) {
  try {
    // Parse search parameters
    const searchParams = req.nextUrl.searchParams;
    
    // Extract parameters
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Get additional product info from URL parameters
    const productTitle = searchParams.get('title') || '';
    const productHandle = searchParams.get('handle') || '';
    
    // Validate required parameters
    if (!productId && !productHandle) {
      return NextResponse.json(
        { error: 'Missing productId or handle parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching reviews for product ${productId || 'with handle ' + productHandle}`);
    console.log(`[API] Additional product info - Title: "${productTitle}", Handle: "${productHandle}"`);
    
    // Initialize Stamped-Shopify integration
    const stampedShopify = new ShopifyStampedIntegration();
    
    // First, try to get Shopify product data if we have the handle
    let shopifyProductData = null;
    if (productHandle) {
      try {
        console.log(`[API] Fetching Shopify product data for handle: ${productHandle}`);
        shopifyProductData = await getProduct(productHandle);
        if (shopifyProductData) {
          console.log(`[API] Found Shopify product: ${shopifyProductData.title}`);
        }
      } catch (shopifyError) {
        console.warn(`[API] Error fetching Shopify product: ${shopifyError}`);
      }
    }

    // Extract key search terms from product title and handle
    let searchTerms: string[] = [];

    if (productTitle) {
      // Extract main product type from title
      // e.g. "4 Norwegian Salmon Portions | 500g Pack" → "Norwegian Salmon"
      const titleWords = productTitle.toLowerCase().split(/\s+/);
      
      // Find product category keywords (common seafood types in your inventory)
      const productTypes = ['salmon', 'kingklip', 'hake', 'basa', 'tuna', 'trout', 'crab', 'seafood', 'fish'];
      
      // Extract product category
      for (const type of productTypes) {
        if (titleWords.includes(type)) {
          // If we find a type like "salmon", also check for modifiers like "norwegian"
          const typeIndex = titleWords.indexOf(type);
          if (typeIndex > 0) {
            const modifier = titleWords[typeIndex - 1];
            if (modifier.length > 3) { // Only use meaningful modifiers
              searchTerms.push(`${modifier} ${type}`);
            }
          }
          searchTerms.push(type);
          break;
        }
      }
    }

    if (productHandle) {
      // Extract words from handle
      const handleWords = productHandle.split('-');
      
      // Look for specific product types
      const productTypeWords = handleWords.filter((word: string) => 
        ['salmon', 'kingklip', 'hake', 'basa', 'trout', 'tuna', 'crab'].includes(word)
      );
      
      if (productTypeWords.length > 0) {
        searchTerms.push(...productTypeWords);
      }
    }

    // If we have search terms, try to find reviews using search
    if (searchTerms.length > 0) {
      try {
        console.log(`[API] Searching for reviews using terms: ${searchTerms.join(', ')}`);
        
        // Try each search term until we find reviews
        for (const term of searchTerms) {
          const searchResults = await searchProductReviews(term, page, limit);
          
          if (searchResults.data && searchResults.data.length > 0) {
            console.log(`[API] Found ${searchResults.data.length} reviews using search term: ${term}`);
            
            // Format the reviews
            const formattedReviews = searchResults.data.map((review: any) => ({
              id: review.id || `review-${Math.random().toString(36).substring(2)}`,
              authorName: review.author || 'Anonymous',
              rating: review.reviewRating || 5,
              reviewTitle: review.reviewTitle || '',
              reviewMessage: review.reviewMessage || '',
              createdAt: review.dateCreated || new Date().toISOString(),
              verified: review.reviewVerifiedType > 0,
              productTitle: review.productName || '',
              shopifyProductId: productId
            }));
            
            // Return the search results
            return NextResponse.json({
              reviews: formattedReviews,
              count: searchResults.total || formattedReviews.length,
              totalPages: searchResults.totalPages || 1,
              currentPage: page,
              source: 'widget_search_api',
              productInfo: {
                id: productId,
                title: productTitle,
                handle: productHandle
              }
            });
          }
        }
        
        console.log(`[API] No reviews found using search terms, continuing with standard methods`);
      } catch (searchError) {
        console.error('[API] Error searching for reviews:', searchError);
        // Continue to standard methods
      }
    }
    
    // If we're here, we didn't find reviews using search, so continue with standard methods
    let reviewsResponse;
    if (productHandle) {
      console.log(`[API] Prioritizing handle-based review search for: ${productHandle}`);
      reviewsResponse = await stampedShopify.getProductReviewsByProductHandle(
        productHandle,
        page,
        limit
      );
      
      // If we found reviews by handle, use them
      if (reviewsResponse.data && reviewsResponse.data.length > 0) {
        console.log(`[API] Found ${reviewsResponse.data.length} reviews using handle search`);
      } else {
        // If no reviews found by handle, fall back to ID search if we have an ID
        if (productId) {
          console.log(`[API] No reviews found by handle, falling back to ID search: ${productId}`);
          // Prepare product ID for Stamped.io
          const shopifyId = shopifyProductData?.id || productId;
          
          // Get reviews using Shopify ID integration
          reviewsResponse = await stampedShopify.getProductReviewsByShopifyId(
            shopifyId,
            page,
            limit
          );
        }
      }
    } else {
      // If no handle provided, use the traditional ID-based approach
      console.log(`[API] Using ID-based review search for: ${productId}`);
      const shopifyId = shopifyProductData?.id || productId;
      
      // Get reviews using Shopify ID integration
      reviewsResponse = await stampedShopify.getProductReviewsByShopifyId(
        shopifyId,
        page,
        limit
      );
    }
    
    // Check if we got any reviews
    const reviews = reviewsResponse?.data || [];
    const totalCount = reviewsResponse?.total || 0;
    const totalPages = reviewsResponse?.totalPages || Math.ceil(totalCount / limit) || 1;
    
    // Format the reviews to normalize the data structure
    const formattedReviews = reviews.map((review: Record<string, any>) => ({
      id: review.id || `review-${Math.random().toString(36).substring(2)}`,
      authorName: review.author || review.authorName || 'Anonymous',
      rating: review.reviewRating || review.rating || 5,
      reviewTitle: review.reviewTitle || review.title || '',
      reviewMessage: review.reviewMessage || review.body || '',
      createdAt: review.dateCreated || review.createdAt || new Date().toISOString(),
      verified: review.reviewVerifiedType > 0 || review.verified || false,
      productTitle: review.productName || '',
      shopifyProductId: shopifyProductData?.id || productId
    }));
    
    // Return the reviews with metadata
    return NextResponse.json({
      reviews: formattedReviews,
      count: totalCount,
      totalPages: totalPages,
      currentPage: page,
      source: 'stamped_shopify_integration',
      filtered: reviewsResponse?.filtered || false,
      originalCount: reviewsResponse?.originalTotal || totalCount,
      productInfo: {
        id: shopifyProductData?.id || productId,
        title: shopifyProductData?.title || productTitle,
        handle: shopifyProductData?.handle || productHandle
      }
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