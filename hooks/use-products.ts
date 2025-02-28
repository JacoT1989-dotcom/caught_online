'use client';

import { useState, useEffect } from 'react';
import { shopifyFetch } from '@/lib/shopify/client';
import { GET_ALL_PRODUCTS } from '@/lib/shopify/queries';

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await shopifyFetch({
          query: GET_ALL_PRODUCTS,
          cache: 'no-store',
        });
        
        if (data?.products?.edges) {
          const fetchedProducts = data.products.edges.map(
            ({ node }: { node: Product }) => node
          );
          setProducts(fetchedProducts);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}