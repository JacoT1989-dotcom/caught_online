'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Percent } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from '@/hooks/use-debounce';
import { SubscriptionToggle } from '@/components/shop/subscription-toggle';
import { useShopSearch } from '@/hooks/use-shop-search';
import { useShopDeals } from '@/hooks/use-shop-deals';
import { FilterDropdown } from './filter-dropdown';
import { cn } from '@/lib/utils';

export function FloatingHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchValue, setSearchValue, clearSearch } = useShopSearch();
  const { showDeals, setShowDeals } = useShopDeals();

  useEffect(() => {
    const mainNav = document.querySelector('.shop-header') as HTMLElement;
    if (!mainNav) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const mainNavBottom = mainNav.getBoundingClientRect().bottom;
      
      // Show when:
      // 1. Scrolled past main nav (mainNavBottom < 0)
      // 2. Scrolled up OR at top
      if (mainNavBottom < 0 && (currentScrollY < lastScrollY || currentScrollY < 100)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearch = useDebounce((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.push(`/products?${params.toString()}`);
  }, 300);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value !== 'featured') {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleDealsToggle = (checked: boolean) => {
    setShowDeals(checked);
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set('deals', 'true');
    } else {
      params.delete('deals');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300 transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
        "top-4"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <FilterDropdown />

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  placeholder="Search products..." 
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
                      handleSearch('');
                    }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>

              <Select 
                defaultValue={searchParams.get('sort') || 'featured'}
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

              <SubscriptionToggle variant="compact" />

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