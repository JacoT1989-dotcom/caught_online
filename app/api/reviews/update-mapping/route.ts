// app/api/reviews/update-mapping/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addProductMapping, cleanProductId, PRODUCT_MAPPINGS } from '@/lib/reviews/product-id-middleware';

/**
 * API route to create or update product ID mappings
 * 
 * This enables you to add new mappings between Shopify and Stamped 
 * product IDs on the fly without changing the code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.shopifyId || !body.stampedId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: shopifyId and stampedId are required'
      }, { status: 400 });
    }
    
    // Clean IDs
    const shopifyId = cleanProductId(body.shopifyId);
    const stampedId = cleanProductId(body.stampedId);
    const title = body.title || '';
    const handle = body.handle || '';
    
    // Add mapping
    const result = addProductMapping(shopifyId, stampedId, title, handle);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: `Successfully added mapping: ${shopifyId} <-> ${stampedId}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Mapping already exists'
      }, { status: 409 });
    }
    
  } catch (error) {
    console.error('[API] Error updating product mapping:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * API to get all existing product mappings
 */
export async function GET(request: NextRequest) {
  try {
    // PRODUCT_MAPPINGS is now directly imported from the middleware
    return NextResponse.json({
      success: true,
      mappings: PRODUCT_MAPPINGS
    });
    
  } catch (error) {
    console.error('[API] Error retrieving product mappings:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}