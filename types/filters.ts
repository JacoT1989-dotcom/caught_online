export type SortOption = "featured" | "price-asc" | "price-desc";

export interface FilterState {
  fish: string[];
  shellfish: string[];
  preparation: string[];
  source: string[];
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}
