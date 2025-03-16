"use client";

import { useEffect } from "react";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductsLayout } from "@/components/shop/products-layout";
import { CollectionHeader } from "@/components/shop/collection-header";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import type { SubscriptionInterval } from "@/lib/types/subscription";
import type { Product } from "@/types/product";

interface ProductsClientPageProps {
  products: Product[];
  searchParams: {
    collection?: string;
    subscription?: string;
    q?: string;
    [key: string]: string | undefined;
  };
}

export function ProductsClientPage({
  products,
  searchParams,
}: ProductsClientPageProps) {
  const { toggle, setInterval } = useSubscriptionToggle();

  // Handle subscription parameter
  useEffect(() => {
    if (searchParams.subscription) {
      // Validate subscription interval
      const validIntervals = ["monthly", "bimonthly", "quarterly"];
      if (validIntervals.includes(searchParams.subscription)) {
        setInterval(searchParams.subscription as SubscriptionInterval);
        toggle();
      }
    }
  }, [searchParams.subscription, setInterval, toggle]);

  return (
    <ProductsLayout>
      <div className="px-2 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          <CollectionHeader collection={searchParams.collection} />
          <ProductGrid products={products} searchQuery={searchParams.q} />
        </div>
      </div>
    </ProductsLayout>
  );
}
