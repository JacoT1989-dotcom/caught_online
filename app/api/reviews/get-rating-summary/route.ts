// app/api/reviews/get-rating-summary/route.ts
import { STAMPED_CONFIG } from '@/lib/reviews/config';
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';
import { getStampedId } from '@/lib/reviews/enhanced-product-middleware';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (!productId) {
    console.error("Missing product ID for get-rating-summary");
    return NextResponse.json({
      rating: 0,
      total: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
    });
  }

  try {
    console.log(`Server: Fetching rating summary for product ${productId}`);
    
    // Get the mapped Stamped ID using our middleware
    const stampedIds = getStampedId(productId);
    const stampedId = stampedIds[0]; // Use the first match
    
    console.log(`Server: Using Stamped ID ${stampedId} for product ${productId}`);
    
    // Initialize the enhanced client with retry and caching
    const stampedClient = new EnhancedStampedClient();
    
    // Try the enhanced client first
    try {
      const ratingData = await stampedClient.getProductRatingSummary(stampedId);
      
      if (ratingData && Array.isArray(ratingData.data) && ratingData.data.length > 0) {
        const productRating = ratingData.data[0];
        
        console.log("Server: Enhanced client succeeded:", productRating);
        
        return NextResponse.json({
          rating: productRating.rating || 0,
          total: productRating.count || 0,
          distribution: productRating.distribution || {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
          }
        });
      }
    } catch (error) {
      console.error("Server: Enhanced client attempt failed:", error);
    }
    
    // Fall back to your multi-approach strategy
    return await tryMultipleApproaches(stampedId);

  } catch (error) {
    console.error("Server error fetching rating summary:", error);
    return NextResponse.json({
      rating: 0,
      total: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
    });
  }
}

// Try multiple approaches to get the rating data
async function tryMultipleApproaches(productId: string) {
  // Try with storeHash parameter first
  try {
    console.log("Server: Trying approach #1 with storeHash");
    
    const url = new URL('https://stamped.io/api/widget/badges');
    url.searchParams.append('apiKey', STAMPED_CONFIG.publicKey);
    url.searchParams.append('storeHash', STAMPED_CONFIG.storeHash);
    url.searchParams.append('productId', productId);
    url.searchParams.append('isIncludeBreakdown', 'true');
    url.searchParams.append('isincludehtml', 'false');
    url.searchParams.append('email', STAMPED_CONFIG.authEmail);
    
    console.log("Server: Approach #1 URL:", url.toString());

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${STAMPED_CONFIG.privateKey}`,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Server: Approach #1 succeeded:", data);
      return NextResponse.json({
        rating: data.rating || 0,
        total: data.count || 0,
        distribution: data.breakdown || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        }
      });
    }
    
    const errorText = await response.text();
    console.error(`Server: Approach #1 failed. Status: ${response.status}`, errorText);
  } catch (error) {
    console.error("Server: Error in approach #1:", error);
  }

  // Try with sId parameter
  try {
    console.log("Server: Trying approach #2 with sId");
    
    const url = new URL('https://stamped.io/api/widget/badges');
    url.searchParams.append('apiKey', STAMPED_CONFIG.publicKey);
    url.searchParams.append('sId', STAMPED_CONFIG.storeHash);
    url.searchParams.append('productId', productId);
    url.searchParams.append('isIncludeBreakdown', 'true');
    url.searchParams.append('isincludehtml', 'false');
    url.searchParams.append('email', STAMPED_CONFIG.authEmail);
    
    console.log("Server: Approach #2 URL:", url.toString());

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${STAMPED_CONFIG.privateKey}`,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Server: Approach #2 succeeded:", data);
      return NextResponse.json({
        rating: data.rating || 0,
        total: data.count || 0,
        distribution: data.breakdown || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        }
      });
    }
    
    const errorText = await response.text();
    console.error(`Server: Approach #2 failed. Status: ${response.status}`, errorText);
  } catch (error) {
    console.error("Server: Error in approach #2:", error);
  }
  
  // Try the stats endpoint as last resort
  try {
    console.log("Server: Trying approach #3 with stats endpoint");
    
    const url = new URL('https://stamped.io/api/widget/stats');
    url.searchParams.append('apiKey', STAMPED_CONFIG.publicKey);
    url.searchParams.append('storeHash', STAMPED_CONFIG.storeHash);
    url.searchParams.append('productId', productId);
    url.searchParams.append('email', STAMPED_CONFIG.authEmail);
    
    console.log("Server: Approach #3 URL:", url.toString());

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${STAMPED_CONFIG.privateKey}`,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Server: Approach #3 succeeded:", data);
      return NextResponse.json({
        rating: data.rating || 0,
        total: data.total || 0,
        distribution: data.distribution || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        }
      });
    }
    
    const errorText = await response.text();
    console.error(`Server: Approach #3 failed. Status: ${response.status}`, errorText);
  } catch (error) {
    console.error("Server: Error in approach #3:", error);
  }

  // If all approaches fail, return empty data
  console.log("Server: All approaches failed, returning default data");
  return NextResponse.json({
    rating: 0,
    total: 0,
    distribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    }
  });
}