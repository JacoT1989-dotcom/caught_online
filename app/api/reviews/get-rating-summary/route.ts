// app/api/reviews/get-rating-summary/route.ts
import { STAMPED_CONFIG } from '@/lib/reviews/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
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
    const response = await fetch(
      `${STAMPED_CONFIG.apiUrl}/widget/stats?` +
        `apiKey=${STAMPED_CONFIG.publicKey}&` +
        `storeHash=${STAMPED_CONFIG.storeHash}&` +
        `productId=${productId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Server-side request - no CORS issues
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch rating summary:", await response.text());
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

    const data = await response.json();
    return NextResponse.json(data);
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
