import type { SearchProduct } from './types';

export function formatSearchResults(edges: any[]): SearchProduct[] {
  return edges.map(({ node }) => {
    const variant = node.variants?.edges[0]?.node;
    const price = variant?.price || node.priceRange.minVariantPrice;
    
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      availableForSale: variant?.availableForSale ?? node.availableForSale,
      image: node.featuredImage?.url,
      price: {
        amount: price.amount,
        currencyCode: price.currencyCode
      },
      compareAtPrice: variant?.compareAtPrice,
      variantId: variant?.id,
    };
  });
}