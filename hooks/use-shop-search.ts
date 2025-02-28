'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShopSearchStore {
  searchValue: string;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
}

export const useShopSearch = create<ShopSearchStore>()(
  persist(
    (set) => ({
      searchValue: '',
      setSearchValue: (value) => set({ searchValue: value }),
      clearSearch: () => set({ searchValue: '' }),
    }),
    {
      name: 'shop-search-storage',
    }
  )
);