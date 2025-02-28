"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useShopFilters } from "@/lib/hooks/use-shop-filters";
import { filterGroups } from "./filter-groups";

// Define types for your filter structure
type FilterValue = string; // Adjust if your values are not strings
type Filters = Record<string, FilterValue[]>;

export function ActiveFilters() {
  const { filters, setFilter, clearFilters } = useShopFilters();

  const activeFilters = Object.entries(filters).flatMap(([category, values]) =>
    values.map((value: FilterValue) => ({
      category,
      value,
      label:
        filterGroups
          .find((group) => group.id === category)
          ?.options.find((option) => option.value === value)?.label || value,
    }))
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {activeFilters.map(({ category, value, label }) => (
        <Button
          key={`${category}-${value}`}
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() =>
            setFilter(category as keyof typeof filters, value, false)
          }
        >
          {label}
          <X className="h-3 w-3" />
        </Button>
      ))}
      {activeFilters.length > 1 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      )}
    </div>
  );
}
