'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from '@/hooks/use-debounce';
import { useShopSearch } from '@/hooks/use-shop-search';
import { FilterDropdown } from './filter-dropdown';
import { cn } from '@/lib/utils';

export function DesktopShopNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchValue, setSearchValue, clearSearch } = useShopSearch();

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

  return (
    <div className="flex items-center gap-4">
      <FilterDropdown />

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
    </div>
  );
}