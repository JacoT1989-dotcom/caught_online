'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { FilterGroups } from './filter-groups';
import { useShopFilters } from '@/hooks/use-shop-filters';
import { Badge } from '@/components/ui/badge';

export function MobileFilters() {
  const [open, setOpen] = useState(false);
  const { filters } = useShopFilters();
  
  // Count active filters
  const activeFilterCount = Object.values(filters)
    .reduce((count, values) => count + values.length, 0);

  return (
    <>
      <Button 
        variant="outline" 
        size="default"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-8">
            <FilterGroups />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}