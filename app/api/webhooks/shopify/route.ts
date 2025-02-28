import { NextResponse } from 'next/server';
import { SHOPIFY_CONFIG } from '@/lib/shopify/config';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhook(
  body: string,
  hmacHeader: string | null
): boolean {
  if (!hmacHeader || !SHOPIFY_CONFIG.adminAccessToken) return false;

  const hash = crypto
    .createHmac('sha256', SHOPIFY_CONFIG.adminAccessToken)
    .update(body)
    .digest('base64');

  return hash === hmacHeader;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const hmacHeader = request.headers.get('X-Shopify-Hmac-SHA256');
    const topic = request.headers.get('X-Shopify-Topic');

    // Verify webhook authenticity
    if (!verifyWebhook(body, hmacHeader)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    switch (topic) {
      case 'products/create':
      case 'products/update':
      case 'products/delete':
        // Handle product changes
        // You might want to invalidate caches or update local data
        break;

      case 'inventory_levels/update':
        // Handle inventory changes
        break;

      case 'orders/create':
        // Handle new orders
        break;

      case 'customers/create':
      case 'customers/update':
        // Handle customer changes
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}