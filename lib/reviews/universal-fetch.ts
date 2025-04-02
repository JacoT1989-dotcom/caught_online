// lib/reviews/universal-fetch.ts

/**
 * Universal API fetch helper that works with both Shopify and Stamped APIs
 * This helps keep consistent logging and error handling for all API calls
 */
export async function universalFetch(url: string, options: RequestInit = {}) {
    // Add default headers if not provided
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    };
    
    // Log the request details
    console.log(`[API] ${options.method || 'GET'} ${url.substring(0, 150)}...`);
    
    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      
      // Log response status
      console.log(`[API] Response Status: ${response.status}`);
      
      // Handle non-successful responses
      if (!response.ok) {
        console.error(`[API] Error: ${response.status} ${response.statusText}`);
        console.error(`[API] Response: ${responseText.substring(0, 200)}...`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Parse JSON response
      try {
        return responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error(`[API] JSON Parse Error:`, parseError);
        return { raw: responseText };
      }
    } catch (error) {
      console.error(`[API] Fetch Error:`, error);
      throw error;
    }
  }
  
  /**
   * A specialized fetch function for Shopify GraphQL API
   */
  export async function shopifyGraphQLFetch(query: string, variables: Record<string, any> = {}) {
    // Get Shopify credentials from env
    const apiUrl = process.env.NEXT_PUBLIC_SHOPIFY_API_URL || '';
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
    
    if (!apiUrl || !accessToken) {
      throw new Error('Missing Shopify API configuration');
    }
    
    // Make GraphQL request
    return universalFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
  }
  
  /**
   * A specialized fetch function for Stamped.io API with authentication
   */
  export async function stampedFetch(url: string, options: RequestInit = {}, config: { publicKey: string, privateKey: string }) {
    // Create Basic Auth token
    const basicAuth = `Basic ${Buffer.from(`${config.publicKey}:${config.privateKey}`).toString('base64')}`;
    
    // Add authorization header
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': basicAuth
      }
    };
    
    // Make request with authentication
    return universalFetch(url, requestOptions);
  }