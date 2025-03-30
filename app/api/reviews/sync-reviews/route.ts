// app/api/reviews/sync-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';
import { 
  getAllMappings, 
  getStampedId, 
  addProductMapping 
} from '@/lib/reviews/enhanced-product-middleware';

/**
 * API route for synchronizing reviews between Shopify and Stamped.io
 * This is useful for ensuring all product IDs are properly mapped
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[SyncReviews] Starting review synchronization');
    
    // Parse the request body
    const data = await req.json();
    const { productIds, force = false } = data;
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing productIds' },
        { status: 400 }
      );
    }
    
    // Initialize Stamped client
    const stampedClient = new EnhancedStampedClient();
    
    // Get current mappings
    const existingMappings = getAllMappings();
    console.log(`[SyncReviews] Found ${existingMappings.length} existing mappings`);
    
    // Results tracking
    const results = {
      total: productIds.length,
      processed: 0,
      reviewsFound: 0,
      newMappings: 0,
      products: [] as any[]
    };
    
    // Process each product ID
    for (const productId of productIds) {
      console.log(`[SyncReviews] Processing product: ${productId}`);
      
      try {
        // Clean up the product ID
        const shopifyId = productId.toString().replace('gid://shopify/Product/', '');
        
        // Check if we already have a mapping
        const stampedIds = getStampedId(shopifyId);
        const hasMapping = stampedIds.length > 0 && stampedIds[0] !== shopifyId;
        
        if (hasMapping && !force) {
          console.log(`[SyncReviews] Mapping already exists for ${shopifyId}`);
          
          // Fetch reviews using existing mapping
          const reviews = await stampedClient.getProductReviews(stampedIds[0]);
          
          results.products.push({
            shopifyId,
            stampedId: stampedIds[0],
            reviewCount: reviews.count || 0,
            newMapping: false
          });
          
          results.reviewsFound += reviews.count || 0;
        } else {
          // Try to find reviews using the Shopify ID directly
          console.log(`[SyncReviews] Trying Shopify ID directly: ${shopifyId}`);
          const directReviews = await stampedClient.getProductReviews(shopifyId);
          
          if (directReviews.count && directReviews.count > 0) {
            console.log(`[SyncReviews] Found ${directReviews.count} reviews using Shopify ID`);
            
            // Create a new mapping if we don't have one
            if (!hasMapping) {
              const title = directReviews.reviews?.[0]?.productTitle || '';
              const handle = '';  // We don't have handle info from this API
              
              addProductMapping(shopifyId, shopifyId, title, handle);
              console.log(`[SyncReviews] Created new mapping: ${shopifyId} -> ${shopifyId}`);
              results.newMappings++;
            }
            
            results.products.push({
              shopifyId,
              stampedId: shopifyId,
              reviewCount: directReviews.count,
              newMapping: !hasMapping
            });
            
            results.reviewsFound += directReviews.count;
          } else {
            // No reviews found for this product
            console.log(`[SyncReviews] No reviews found for ${shopifyId}`);
            
            results.products.push({
              shopifyId,
              stampedId: null,
              reviewCount: 0,
              newMapping: false
            });
          }
        }
        
        results.processed++;
      } catch (error) {
        console.error(`[SyncReviews] Error processing product ${productId}:`, error);
        
        // Add to results with error
        results.products.push({
          shopifyId: productId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        results.processed++;
      }
    }
    
    // Return the synchronization results
    return NextResponse.json({
      success: true,
      message: `Synchronized reviews for ${results.processed} products`,
      results
    });
  } catch (error) {
    console.error('[SyncReviews] Unhandled error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during synchronization' 
      },
      { status: 500 }
    );
  }
}

/**
 * API route for getting the synchronization status
 */
export async function GET(req: NextRequest) {
  try {
    // Get all current mappings
    const mappings = getAllMappings();
    
    // Initialize Stamped client to check connection
    const stampedClient = new EnhancedStampedClient();
    const connectionResult = await stampedClient.verifyConnection();
    
    return NextResponse.json({
      success: true,
      apiConnected: connectionResult.success,
      mappingsCount: mappings.length,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('[SyncReviews] Error getting sync status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting sync status' 
      },
      { status: 500 }
    );
  }
}