"use client";

import { useState, useEffect } from "react";
import { CategoryList } from "./category-list";
import { AllProductsSection } from "./all-products-section";
import { Container } from "@/components/ui/container";
import { shopifyFetch } from "@/lib/shopify/client";
import { categories } from "@/lib/config/categories";

export function DesktopCategories() {
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
            return [category.collection, product.featuredImage.url] as [
              string,
              string
            ];
          }
          return null;
        });

        const results = await Promise.all(imagePromises);

        // Fix: Filter out null values and explicitly type the result as an array of tuples
        const validResults = results.filter(
          (item): item is [string, string] => item !== null
        );
        const images = Object.fromEntries(validResults);

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
    <Container className="py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <CategoryList loading={loading} categoryImages={categoryImages} />
        <AllProductsSection />
      </div>
    </Container>
  );
}
