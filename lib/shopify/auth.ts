import { SHOPIFY_CONFIG } from './config';

const AUTH_ENDPOINTS = {
  authorize: 'https://shopify.com/authentication/31009278/oauth/authorize',
  token: 'https://shopify.com/authentication/31009278/oauth/token',
  logout: 'https://shopify.com/authentication/31009278/logout'
};

export async function getCustomerToken(code: string) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Account-Id': SHOPIFY_CONFIG.customerAccountId || '',
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: SHOPIFY_CONFIG.customerAccountId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting customer token:', error);
    throw error;
  }
}

export function getAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CONFIG.customerAccountId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
  });

  return `${AUTH_ENDPOINTS.authorize}?${params.toString()}`;
}

export function getLogoutUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CONFIG.customerAccountId || '',
    return_to: redirectUri,
  });

  return `${AUTH_ENDPOINTS.logout}?${params.toString()}`;
}