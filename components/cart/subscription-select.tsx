'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';

export function getDiscountRate(subscription: string | null): number {
  if (!subscription || subscription === 'none') return 0;
  return SUBSCRIPTION_PLANS[subscription as keyof typeof SUBSCRIPTION_PLANS]?.discount || 0;
}

interface SubscriptionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  price?: number;
  variant?: 'default' | 'compact';
}

export function SubscriptionSelect({ 
  value, 
  onValueChange,
  price,
  variant = 'default'
}: SubscriptionSelectProps) {
  const selectedOption = value !== 'none' ? SUBSCRIPTION_PLANS[value as keyof typeof SUBSCRIPTION_PLANS] : null;
  const discountedPrice = price ? price * (1 - (selectedOption?.discount || 0)) : undefined;

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={cn(
            "w-full",
            variant === 'compact' && [
              "h-7 text-xs border-none bg-transparent hover:bg-transparent px-0",
              "focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0",
              "focus-visible:outline-none focus:outline-none"
            ],
            value !== 'none' && "border-[#41c8d2]/20 bg-[#41c8d2]/5"
          )}
        >
          <SelectValue placeholder="Select delivery frequency" />
        </SelectTrigger>
        <SelectContent align="start" className="w-[240px]">
          <SelectItem value="none" className="pl-2">
            One-time purchase
          </SelectItem>
          <div className="px-2 py-1 text-xs text-muted-foreground border-t">
            Subscribe & Save
          </div>
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <SelectItem key={key} value={key} className="pl-2">
              <div className="flex items-center justify-between w-full">
                <span>{plan.label} ({(plan.discount * 100)}% off)</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {price && discountedPrice && value !== 'none' && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span>Subscription price:</span>
            <span className="font-medium text-[#41c8d2]">
              {formatPrice(discountedPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Regular price:</span>
            <span className="line-through">
              {formatPrice(price)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}