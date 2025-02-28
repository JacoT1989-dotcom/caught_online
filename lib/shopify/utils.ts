export function isValidResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data !== null &&
    typeof response.data === 'object'
  );
}

export function formatShopifyResponse<T>(response: any): T {
  if (!isValidResponse(response)) {
    throw new Error('Invalid Shopify response format');
  }
  return response.data;
}

export function normalizeProduct(product: any) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    price: product.priceRange.minVariantPrice,
    featuredImage: product.images?.edges[0]?.node || null,
    availableForSale: product.variants?.edges[0]?.node?.availableForSale || false,
    quantityAvailable: product.variants?.edges[0]?.node?.quantityAvailable || 0,
  };
}