"use client";

import { useEffect, useState } from "react";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_BEST_SELLERS } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";

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
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBestSellers() {
      try {
        const { data } = await shopifyFetch({
          query: GET_BEST_SELLERS,
        });

        const formattedProducts = data.products.edges.map(
          ({ node }: { node: Product }) => node
        );
        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching best sellers:", err);
        setError("Failed to load best selling products");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBestSellers();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="container py-12">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Best Sellers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
