'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

export function useProductFilter(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered results with immediate updates
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;

    return products.filter(product => {
      const titleMatch = product.title.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);
      return titleMatch || descriptionMatch;
    });
  }, [products, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
  };
}