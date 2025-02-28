'use client';

import { useEffect } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { useRegion } from '@/hooks/use-region';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryStatusProps {
  handle: string;
  className?: string;
  showCount?: boolean;
}

export function InventoryStatus({ handle, className, showCount = false }: InventoryStatusProps) {
  const { selectedRegion } = useRegion();
  const { loading, inventoryStatus, checkProductInventory } = useInventory();

  useEffect(() => {
    if (handle && selectedRegion) {
      checkProductInventory(handle);
    }
  }, [handle, selectedRegion, checkProductInventory]);

  if (loading) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (!selectedRegion) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <MapPin className="h-4 w-4" />
        Select region
      </Badge>
    );
  }

  const regionStock = inventoryStatus.locationAvailability[selectedRegion];
  const isAvailable = regionStock?.available;
  const quantity = regionStock?.quantity || 0;

  if (!isAvailable) {
    return (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        <AlertCircle className="h-4 w-4" />
        Out of Stock
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn("gap-1 bg-green-100 text-green-700 hover:bg-green-100", className)}>
      <CheckCircle2 className="h-4 w-4" />
      {showCount ? `${quantity} in stock` : 'In Stock'}
    </Badge>
  );
}