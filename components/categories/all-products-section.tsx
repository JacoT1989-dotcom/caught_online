"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { shopifyFetch } from "@/lib/shopify/client";
import { formatPrice } from "@/lib/utils";
import { useShopDeals } from "@/hooks/use-shop-deals";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";

const GET_FEATURED_PRODUCTS = `
  query GetFeaturedProducts {
    products(first: 6, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle
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
                title
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
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

export function AllProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { applyDealsFilter } = useShopDeals();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await shopifyFetch({
          query: GET_FEATURED_PRODUCTS,
        });

        if (data?.products?.edges) {
          // Transform data to match our Product type
          const transformedProducts: Product[] = data.products.edges.map(
            ({ node }: any) => ({
              id: node.id,
              title: node.title,
              handle: node.handle,
              availableForSale: node.availableForSale,
              featuredImage: node.featuredImage || {
                url: "",
                altText: node.title,
              },
              priceRange: {
                minVariantPrice: node.priceRange.minVariantPrice,
              },
              variants: node.variants,
            })
          );
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = applyDealsFilter(products);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-12 mb-16">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="aspect-[4/5] animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-12 mb-16">
      <h2 className="text-lg font-semibold">Featured Products</h2>
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const variant = product.variants?.edges[0]?.node;
          const price = parseFloat(
            variant?.price?.amount || product.priceRange.minVariantPrice.amount
          );
          const compareAtPrice = variant?.compareAtPrice?.amount;
          const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > price;

          return (
            <Link key={product.id} href={`/products/${product.handle}`}>
              <Card
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  "hover:border-[#41c8d2]/20 hover:shadow-lg"
                )}
              >
                <div className="aspect-[4/3] relative">
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-white">
                        {formatPrice(price)}
                      </span>
                      {isOnSale && (
                        <span className="text-xs text-white/80 line-through">
                          {formatPrice(parseFloat(compareAtPrice))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
