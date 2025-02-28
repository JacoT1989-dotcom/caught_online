import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterState } from "@/lib/types/filters";

interface ShopFiltersStore {
  filters: FilterState;
  setFilter: (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

const initialState: FilterState = {
  fish: [],
  shellfish: [],
  preparation: [],
  source: [],
};

export const useShopFilters = create<ShopFiltersStore>()(
  persist(
    (set, get) => ({
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
      get activeFilterCount() {
        const { filters } = get();
        return Object.values(filters).flat().length;
      },
    }),
    {
      name: "shop-filters",
    }
  )
);
