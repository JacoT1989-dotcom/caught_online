'use client';

import { useState } from 'react';
import { shopifyFetch } from '@/lib/shopify/client';

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!) {
    products(first: 10, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  image: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

export function useSearchResults() {
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await shopifyFetch({
        query: SEARCH_PRODUCTS_QUERY,
        variables: { query },
        cache: 'no-store'
      });

      if (data?.products?.edges) {
        const formattedResults = data.products.edges.map(({ node }: any) => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          availableForSale: node.availableForSale,
          image: node.featuredImage?.url,
          price: node.variants?.edges[0]?.node?.price || node.priceRange.minVariantPrice,
        }));
        setResults(formattedResults);
      }
    } catch (err) {
      setError('Failed to search products');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
  };
}