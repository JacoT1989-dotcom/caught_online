'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useShopSearch } from '@/hooks/use-shop-search';
import { cn } from '@/lib/utils';

export function ShopSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchValue, setSearchValue, clearSearch } = useShopSearch();

  const handleSearch = useDebounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.push(`/products?${params.toString()}`);
  }, 300);

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input 
          placeholder="Search products..." 
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
          className={cn(
            "pl-10 pr-10 bg-white dark:bg-gray-950",
            "focus:ring-1 focus:ring-primary"
          )}
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
    </div>
  );
}