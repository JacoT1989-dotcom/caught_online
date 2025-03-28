"use client";

import { FilterDropdown } from "./filter-dropdown";
import { ShopSearch } from "./shop-search";
import { SortDropdown } from "./sort-dropdown";
import { SubscriptionToggle } from "./subscription-toggle";
import { DealsToggle } from "./deals-toggle";

export function ShopNav() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      {/* Search Bar */}
      <div className="relative flex-1 w-full px-2 md:px-0">
        <ShopSearch />
      </div>

      {/* Mobile Controls - First Row */}
      <div className="flex w-full gap-2 px-2 md:px-0 md:hidden">
        <div className="w-[110px]">
          <FilterDropdown />
        </div>
        <div className="flex-1">
          <SortDropdown />
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex items-center gap-3">
        <FilterDropdown />
        <SortDropdown />
        <div className="w-[240px]">
          <SubscriptionToggle variant="compact" />
        </div>
        <div className="w-[140px]">
          <DealsToggle />
        </div>
      </div>

      {/* Mobile Controls - Second Row */}
      <div className="flex w-full gap-2 px-2 md:px-0 md:hidden">
        <div className="flex-1">
          <SubscriptionToggle variant="compact" />
        </div>
        <div className="flex-1">
          <DealsToggle />
        </div>
      </div>
    </div>
  );
}
