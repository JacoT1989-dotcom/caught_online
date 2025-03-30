// app/api/reviews/check-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';

/**
 * API route to check the connection to Stamped.io
 * Used by the admin interface to verify API connectivity
 */
export async function GET(req: NextRequest) {
  try {
    console.log('Checking Stamped.io API connection...');
    
    // Initialize the Stamped client
    const stampedClient = new EnhancedStampedClient();
    
    // Verify the connection
    const result = await stampedClient.verifyConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Stamped.io API',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Connection to Stamped.io API failed: ${result.message || 'Unknown error'}`,
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 503 }); // 503 Service Unavailable
    }
  } catch (error) {
    console.error('Error checking Stamped.io API connection:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error checking Stamped.io API connection',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}