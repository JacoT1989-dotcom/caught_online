import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterState } from "@/types/filters";

interface ShopFiltersStore {
  filters: FilterState;
  setFilter: (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => void;
  clearFilters: () => void;
}

const initialState: FilterState = {
  type: [],
  preparation: [],
  origin: [],
};

export const useShopFilters = create<ShopFiltersStore>()(
  persist(
    (set) => ({
      filters: initialState,
      setFilter: (category, value, checked) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [category]: checked
              ? [...state.filters[category], value]
              : state.filters[category].filter((v) => v !== value),
          },
        }));
      },
      clearFilters: () => set({ filters: initialState }),
    }),
    {
      name: "shop-filters",
    }
  )
);
