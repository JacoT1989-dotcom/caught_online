'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDealsToggle } from '@/hooks/use-shop-deals';
import { cn } from '@/lib/utils';

export function DealsToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showDeals, handleDealsToggle } = useDealsToggle();

  return (
    <div className={cn(
      "flex items-center justify-between gap-2 px-3 h-10 rounded-md border w-full",
      "bg-background/95 transition-colors duration-200",
      showDeals && "border-[#f6424a]/20 bg-[#f6424a]/5"
    )}>
      <Label className="text-sm font-medium">Deals</Label>
      <Switch
        checked={showDeals}
        onCheckedChange={(checked) => handleDealsToggle(router, searchParams, checked)}
        className="data-[state=checked]:bg-[#f6424a]"
      />
    </div>
  );
}