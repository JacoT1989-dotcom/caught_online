"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { categories } from "@/lib/config/categories";
import { useShopDeals } from "@/hooks/use-shop-deals";
import { CategoryList } from "./category-list";
import { AllProductsSection } from "./all-products-section";
import { ShopSearch } from "@/components/shop/shop-search";

// Define the CategoryType based on available collections
type CategoryCollection = (typeof categories)[number]["collection"];

export function MobileCategories() {
  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function fetchCategoryImages() {
      try {
        const imagePromises = categories.map(async (category) => {
          const { data } = await shopifyFetch({
            query: `
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
            `,
            variables: { collection: category.collection },
          });

          const product = data?.collection?.products?.edges[0]?.node;
          if (product?.featuredImage?.url) {
            return [category.collection, product.featuredImage.url];
          }
          return undefined;
        });

        const results = await Promise.all(imagePromises);

        // Convert the results to a valid entries array
        const validEntries: [string, string][] = [];
        for (const result of results) {
          if (result) {
            validEntries.push([result[0], result[1]]);
          }
        }

        const images = Object.fromEntries(validEntries);
        setCategoryImages(images);
      } catch (error) {
        console.error("Error fetching category images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryImages();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-[calc(var(--header-height)+var(--banner-height))] z-10 bg-background border-b">
        <div className="p-4">
          <ShopSearch />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4">
        <CategoryList loading={loading} categoryImages={categoryImages} />
        <AllProductsSection />
      </div>
    </div>
  );
}
