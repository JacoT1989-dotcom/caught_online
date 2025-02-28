"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShopSearch } from "./shop-search";
import { MobileFilters } from "./filters/mobile-filters";

export function MobileShopNav() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value !== "featured") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-2 mb-3">
      <div className="flex gap-3">
        <MobileFilters />
        <ShopSearch />
      </div>

      <Select
        defaultValue={searchParams.get("sort") || "featured"}
        onValueChange={handleSort}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="best-selling">Best Selling</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
