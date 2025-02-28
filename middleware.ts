import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Get region from KV via cookie
    const regionStorage = request.cookies.get('region-storage')?.value;
    const region = regionStorage ? JSON.parse(regionStorage).state.selectedRegion : null;

    // Clone the headers to add region info
    const requestHeaders = new Headers(request.headers);
    if (region) {
      requestHeaders.set('x-region', region);
    }

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue the request even if there's an error parsing the region
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};