// app/api/reviews/get-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { STAMPED_CONFIG } from '@/lib/reviews/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const page = searchParams.get('page') || '1';

  if (!productId || !STAMPED_CONFIG.publicKey || !STAMPED_CONFIG.storeHash) {
    return NextResponse.json({ reviews: [] });
  }

  try {
    const response = await fetch(
      `${STAMPED_CONFIG.apiUrl}/reviews?` +
        `apiKey=${STAMPED_CONFIG.publicKey}&` +
        `storeHash=${STAMPED_CONFIG.storeHash}&` +
        `productId=${productId}&` +
        `page=${page}&` +
        `perPage=10&` +
        `sortBy=dateCreated&` +
        `sortDirection=desc`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Server-side request - no CORS issues
      }
    );

    if (!response.ok) {
      return NextResponse.json({ reviews: [] }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error fetching reviews:", error);
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }
}


