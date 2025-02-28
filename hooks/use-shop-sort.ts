'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

interface ShopSortStore {
  sortKey: SortOption;
  setSortKey: (key: SortOption) => void;
}

export const useShopSort = create<ShopSortStore>()(
  persist(
    (set) => ({
      sortKey: 'featured',
      setSortKey: (key) => set({ sortKey: key }),
    }),
    {
      name: 'shop-sort-storage',
    }
  )
);