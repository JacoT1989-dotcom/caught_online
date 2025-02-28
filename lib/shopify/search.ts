'use client';

import { shopifyFetch } from './client';
import { SEARCH_PRODUCTS_QUERY } from './queries/search';
import type { SearchProduct } from '@/types/search';

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const { data } = await shopifyFetch({
      query: SEARCH_PRODUCTS_QUERY,
      variables: { 
        query,
        first: 50 // Increased limit for more comprehensive results
      },
      cache: 'no-store'
    });

    if (!data?.products?.edges) {
      return [];
    }

    return data.products.edges.map(({ node }: any) => {
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
        quantityAvailable: variant?.quantityAvailable
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}