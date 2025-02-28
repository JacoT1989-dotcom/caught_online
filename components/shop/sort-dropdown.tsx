'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShopSort } from '@/hooks/use-shop-sort';
import type { SortOption } from '@/hooks/use-shop-sort';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export function SortDropdown() {
  const { sortKey, setSortKey } = useShopSort();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortOption)}>
      <SelectTrigger className={cn(
        isMobile ? "w-full" : "w-[240px]"
      )}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}