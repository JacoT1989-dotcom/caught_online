'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const filters = {
  type: [
    { id: 'fresh', label: 'Fresh' },
    { id: 'frozen', label: 'Frozen' },
    { id: 'live', label: 'Live' },
  ],
  preparation: [
    { id: 'whole', label: 'Whole' },
    { id: 'fillet', label: 'Fillet' },
    { id: 'portioned', label: 'Portioned' },
    { id: 'cleaned', label: 'Cleaned' },
  ],
  origin: [
    { id: 'local', label: 'Local' },
    { id: 'imported', label: 'Imported' },
    { id: 'farmed', label: 'Farmed' },
    { id: 'wild-caught', label: 'Wild Caught' },
  ]
};

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilters = searchParams.get('filters')?.split(',').filter(Boolean) || [];

  const updateFilters = (category: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    const currentFilters = params.get('filters')?.split(',').filter(Boolean) || [];
    const filterKey = `${category}:${value}`;
    
    let newFilters;
    if (checked) {
      newFilters = [...currentFilters, filterKey];
    } else {
      newFilters = currentFilters.filter(f => f !== filterKey);
    }

    if (newFilters.length > 0) {
      params.set('filters', newFilters.join(','));
    } else {
      params.delete('filters');
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={cn(
      "sticky top-[180px] w-52 transition-all duration-300",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 rounded-lg"
    )}>
      <div className="p-4 space-y-6">
        {/* Filter Categories */}
        {Object.entries(filters).map(([category, options]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-medium capitalize">
              {category.replace('-', ' ')}
            </h3>
            <div className="space-y-3">
              {options.map((option) => {
                const filterKey = `${category}:${option.id}`;
                const isChecked = activeFilters.includes(filterKey);
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Switch
                      id={option.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => 
                        updateFilters(category, option.id, checked)
                      }
                      className="data-[state=checked]:bg-[#f6424a]"
                    />
                    <Label 
                      htmlFor={option.id}
                      className="text-sm font-normal leading-none cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}