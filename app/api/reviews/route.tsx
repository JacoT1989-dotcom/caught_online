import { STAMPED_CONFIG } from '@/lib/stamped';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const apiUrl = `${STAMPED_CONFIG.apiUrl}/v2/reviews/${STAMPED_CONFIG.storeHash}/${productId}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${STAMPED_CONFIG.publicKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      reviews: data.reviews || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Error fetching reviews from Stamped.io:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.productId || !body.title || !body.content || !body.rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiUrl = `${STAMPED_CONFIG.apiUrl}/v2/reviews/${STAMPED_CONFIG.storeHash}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STAMPED_CONFIG.publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: body.productId,
        rating: body.rating,
        title: body.title,
        content: body.content,
        author: body.author || 'Anonymous',
        email: body.email || '',
        isVerifiedBuyer: body.isVerifiedBuyer || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.status}`);
    }

    return NextResponse.json({ message: 'Review added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
