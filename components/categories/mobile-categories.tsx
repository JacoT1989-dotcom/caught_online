"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { categories } from "@/lib/config/categories";
import { CategoryList } from "./category-list";
import { AllProductsSection } from "./all-products-section";
import { ShopSearch } from "@/components/shop/shop-search";
import { Skeleton } from "@/components/ui/skeleton";

// Define the CategoryType based on available collections
type CategoryCollection = (typeof categories)[number]["collection"];

// GraphQL query - moved outside component to avoid recreation on each render
const COLLECTION_QUERY = `
  query GetCollectionFeaturedProduct($collection: String!) {
    collection(handle: $collection) {
      products(first: 1, sortKey: BEST_SELLING) {
        edges {
          node {
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export function MobileCategories() {
  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchCategoryImages = useCallback(async () => {
    try {
      // Use Promise.allSettled to handle potential failures more gracefully
      const imagePromises = categories.map(category => 
        shopifyFetch({
          query: COLLECTION_QUERY,
          variables: { collection: category.collection },
        })
        .then(({ data }) => {
          const imageUrl = data?.collection?.products?.edges[0]?.node?.featuredImage?.url;
          return imageUrl ? [category.collection, imageUrl] : null;
        })
        .catch(error => {
          console.error(`Error fetching image for ${category.collection}:`, error);
          return null;
        })
      );

      const results = await Promise.allSettled(imagePromises);
      
      // Process successful promises and filter out failures
      const validEntries = results
        .filter((result): result is PromiseFulfilledResult<[string, string] | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value) as [string, string][];
      
      setCategoryImages(Object.fromEntries(validEntries));
    } catch (error) {
      console.error("Error fetching category images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use effect with empty dependency array as fetchCategoryImages is memoized
  useEffect(() => {
    fetchCategoryImages();
  }, [fetchCategoryImages]);

  // Memoize the skeleton placeholders
  const skeletonPlaceholders = useMemo(() => (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="w-24 h-24 rounded-lg" />
      ))}
    </div>
  ), []);

  return (
    <div className="space-y-6">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-md">
        <div className="p-4">
          <ShopSearch />
        </div>
      </div>

      {/* Category List with Horizontal Scroll for Mobile */}
      <div className="px-4">
        {loading ? skeletonPlaceholders : (
          <CategoryList loading={loading} categoryImages={categoryImages} />
        )}
      </div>

      {/* All Products Section */}
      <AllProductsSection />
    </div>
  );
}