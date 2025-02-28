"use client";

import { ShopSearch } from "@/components/shop/shop-search";
import { MobileFilters } from "../shop/filters";

export function MobileSearchHeader() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <MobileFilters />
        <ShopSearch />
      </div>
    </div>
  );
}
