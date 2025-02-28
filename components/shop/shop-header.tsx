"use client";

import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { FilterDropdown } from "./filter-dropdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Percent } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { SubscriptionToggle } from "@/components/shop/subscription-toggle";
import { useShopSearch } from "@/hooks/use-shop-search";
import { useShopDeals } from "@/hooks/use-shop-deals";
import { MobileFilters } from "./filters/mobile-filters";

export function ShopHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchValue, setSearchValue, clearSearch } = useShopSearch();
  const { showDeals, setShowDeals } = useShopDeals();
  const { isVisible } = useScroll(50);

  const handleSearch = useDebounce((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
  }, 300);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value !== "featured") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleDealsToggle = (checked: boolean) => {
    setShowDeals(checked);
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("deals", "true");
    } else {
      params.delete("deals");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "sticky z-40 transition-all duration-300 transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
        "top-[calc(var(--header-height,56px)+var(--banner-height,28px)+8px)]"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              {/* Desktop Filters */}
              <div className="hidden md:block">
                <FilterDropdown />
              </div>

              {/* Mobile Filters */}
              <div className="md:hidden">
                <MobileFilters />
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-10 pr-10 bg-white dark:bg-gray-950"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent z-10"
                    onClick={() => {
                      clearSearch();
                      handleSearch("");
                    }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>

              {/* Sort */}
              <Select
                defaultValue={searchParams.get("sort") || "featured"}
                onValueChange={handleSort}
              >
                <SelectTrigger className="w-[180px]">
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

              {/* Subscription Toggle */}
              <SubscriptionToggle variant="compact" />

              {/* Deals Toggle */}
              <div className="flex items-center gap-2 px-3 h-10 rounded-md border bg-background/95">
                <Switch
                  checked={showDeals}
                  onCheckedChange={handleDealsToggle}
                  className="data-[state=checked]:bg-[#f6424a]"
                />
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Deals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
