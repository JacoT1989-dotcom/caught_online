import { shopifyFetch } from '../client';
import { SEARCH_PRODUCTS_QUERY } from './query';
import type { SearchResponse } from './types';

export async function searchProducts(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return { products: [], totalCount: 0 };
  }

  try {
    const { data } = await shopifyFetch({
      query: SEARCH_PRODUCTS_QUERY,
      variables: { query },
      cache: 'no-store'
    });

    if (!data?.products?.edges) {
      return { products: [], totalCount: 0 };
    }

    const products = data.products.edges.map(({ node }: any) => {
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

    return {
      products,
      totalCount: products.length
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}