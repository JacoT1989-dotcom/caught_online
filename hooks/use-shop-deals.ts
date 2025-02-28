"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface ShopDealsStore {
  showDeals: boolean;
  setShowDeals: (value: boolean) => void;
  toggleDeals: () => void;
  applyDealsFilter: (products: Product[]) => Product[];
}

export const useShopDeals = create<ShopDealsStore>()(
  persist(
    (set, get) => ({
      showDeals: false,
      setShowDeals: (value) => set({ showDeals: value }),
      toggleDeals: () => set((state) => ({ showDeals: !state.showDeals })),
      applyDealsFilter: (products) => {
        const { showDeals } = get();
        if (!showDeals) return products;

        return products.filter((product) => {
          const variant = product.variants?.edges[0]?.node;
          return (
            variant?.compareAtPrice &&
            parseFloat(variant.compareAtPrice.amount) >
              parseFloat(variant.price.amount)
          );
        });
      },
    }),
    {
      name: "shop-deals-storage",
    }
  )
);

// Separate hook for handling deals toggle with router
export function useDealsToggle() {
  const { showDeals, setShowDeals } = useShopDeals();

  const handleDealsToggle = async (
    router: any, // Using 'any' temporarily to avoid dependency on app-router-context
    searchParams: URLSearchParams | { toString: () => string },
    checked: boolean
  ) => {
    // Update local state
    setShowDeals(checked);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("deals", "true");
    } else {
      params.delete("deals");
    }

    // Force a refresh by using router.refresh() after navigation
    await router.push(`/products?${params.toString()}`);
    router.refresh();
  };

  return {
    showDeals,
    handleDealsToggle,
  };
}
