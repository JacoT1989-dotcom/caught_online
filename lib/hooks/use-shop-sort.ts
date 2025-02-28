import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortOption } from '@/lib/types/filters';

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
      name: 'shop-sort',
    }
  )
);