// app/api/reviews/test-connection/route.ts
import { NextResponse } from 'next/server';
import { StampedApiClient } from '@/lib/reviews/stamped-api';
import { STAMPED_CONFIG } from '@/lib/reviews/config';

/**
 * Utility endpoint to test Stamped.io API connection
 */
export async function GET() {
  try {
    // Output current config (redacting private key)
    console.log('Testing Stamped connection with config:', {
      publicKey: STAMPED_CONFIG.publicKey ? 'Set' : 'Not set',
      privateKey: STAMPED_CONFIG.privateKey ? 'Set (redacted)' : 'Not set',
      storeHash: STAMPED_CONFIG.storeHash,
      storeUrl: STAMPED_CONFIG.storeUrl,
    });
    
    const client = new StampedApiClient();
    const result = await client.verifyConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Connection successful' : 'Connection failed',
      config: {
        publicKey: STAMPED_CONFIG.publicKey ? '✓ Set' : '✗ Missing',
        privateKey: STAMPED_CONFIG.privateKey ? '✓ Set' : '✗ Missing',
        storeHash: STAMPED_CONFIG.storeHash ? '✓ Set' : '✗ Missing',
        storeUrl: STAMPED_CONFIG.storeUrl ? `✓ Set (${STAMPED_CONFIG.storeUrl})` : '✗ Missing',
      },
      error: result.success ? null : result.error
    });
  } catch (error) {
    console.error('Error testing Stamped connection:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Connection test failed with error',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        publicKey: STAMPED_CONFIG.publicKey ? '✓ Set' : '✗ Missing',
        privateKey: STAMPED_CONFIG.privateKey ? '✓ Set' : '✗ Missing',
        storeHash: STAMPED_CONFIG.storeHash ? '✓ Set' : '✗ Missing',
        storeUrl: STAMPED_CONFIG.storeUrl ? `✓ Set (${STAMPED_CONFIG.storeUrl})` : '✗ Missing',
      }
    }, { status: 500 });
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';