'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useShopFilters } from '@/hooks/use-shop-filters';
import type { FilterGroup } from '@/types/filters';

export const filterGroups: FilterGroup[] = [
  {
    id: 'fish',
    label: 'Fish',
    options: [
      { id: 'fillets', label: 'Fillets', value: 'fillets' },
      { id: 'portions', label: 'Portions', value: 'portions' },
      { id: 'skin-on', label: 'Skin-On', value: 'skin-on' },
      { id: 'skin-off', label: 'Skin-Off', value: 'skin-off' },
    ],
  },
  {
    id: 'shellfish',
    label: 'Shellfish',
    options: [
      { id: 'whole', label: 'Whole', value: 'whole' },
      { id: 'deveined', label: 'De-Veined', value: 'deveined' },
      { id: 'shell-on', label: 'Shell-On', value: 'shell-on' },
      { id: 'shell-off', label: 'Shell-Off', value: 'shell-off' },
    ],
  },
  {
    id: 'preparation',
    label: 'Preparation',
    options: [
      { id: 'smoked', label: 'Smoked', value: 'smoked' },
      { id: 'crumbed', label: 'Crumbed', value: 'crumbed' },
    ],
  },
  {
    id: 'source',
    label: 'Source',
    options: [
      { id: 'wild-caught', label: 'Wild-Caught', value: 'wild-caught' },
      { id: 'sustainably-farmed', label: 'Sustainably-Farmed', value: 'sustainably-farmed' },
    ],
  }
];

export function FilterGroups() {
  const { filters, setFilter } = useShopFilters();

  return (
    <div className="space-y-6">
      {filterGroups.map((group) => (
        <div key={group.id} className="space-y-3">
          <h3 className="font-medium capitalize">{group.label}</h3>
          <div className="space-y-3">
            {group.options.map((option) => {
              const isChecked = filters[group.id as keyof typeof filters].includes(option.value);
              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <Switch
                    id={option.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      setFilter(group.id as keyof typeof filters, option.value, checked)
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
  );
}