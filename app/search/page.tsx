'use client';

import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/search/search-input';
import { useShopSearch } from '@/hooks/use-shop-search';
import { ProductGridSection } from '@/components/home/product-grid-section';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/shopify/products';
import type { Product } from '@/types/product';

export default function SearchPage() {
  const router = useRouter();
  const { setSearchValue } = useShopSearch();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [featured, newest] = await Promise.all([
          getProducts({ sortKey: 'BEST_SELLING', first: 8 }),
          getProducts({ sortKey: 'CREATED_AT', reverse: true, first: 8 })
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newest);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }

    loadProducts();
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setSearchValue(value);
      router.push(`/products?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="sticky top-[calc(var(--header-height)+var(--banner-height))] z-10 bg-background border-b">
        <div className="p-3">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search products..."
          />
        </div>
      </div>

      {/* Product Feeds */}
      <div className="py-4 space-y-8">
        {featuredProducts.length > 0 && (
          <ProductGridSection 
            title="Featured Products" 
            products={featuredProducts}
            className="py-0"
          />
        )}
        
        {newArrivals.length > 0 && (
          <ProductGridSection 
            title="New Arrivals" 
            products={newArrivals}
            className="py-0"
          />
        )}
      </div>
    </div>
  );
}