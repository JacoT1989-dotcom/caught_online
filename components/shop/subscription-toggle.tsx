'use client';

import { useEffect } from 'react';
import { useSubscriptionToggle } from '@/hooks/use-subscription-toggle';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';
import { useSearchParams } from 'next/navigation';

interface SubscriptionToggleProps {
  variant?: 'default' | 'compact';
}

export function SubscriptionToggle({ variant = 'default' }: SubscriptionToggleProps) {
  const { isSubscriptionMode, toggle, selectedInterval, setInterval } = useSubscriptionToggle();
  const searchParams = useSearchParams();

  // Handle subscription parameter from URL
  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription');
    if (subscriptionParam && subscriptionParam in SUBSCRIPTION_PLANS) {
      setInterval(subscriptionParam as keyof typeof SUBSCRIPTION_PLANS);
      if (!isSubscriptionMode) {
        toggle();
      }
    }
  }, [searchParams, setInterval, toggle, isSubscriptionMode]);

  if (variant === 'compact') {
    if (isSubscriptionMode) {
      return (
        <Select
          value={selectedInterval || 'monthly'}
          onValueChange={setInterval}
        >
          <SelectTrigger className={cn(
            "w-full border transition-colors duration-200",
            "border-[#41c8d2]/20 bg-[#41c8d2]/5"
          )}>
            <SelectValue className="text-left" />
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
                {plan.label} ({(plan.discount * 100)}% off)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className={cn(
        "flex items-center gap-2 px-2 h-10 rounded-md border w-full",
        "bg-background/95 transition-colors duration-200"
      )}>
        <Switch
          checked={isSubscriptionMode}
          onCheckedChange={toggle}
          className="data-[state=checked]:bg-[#41c8d2]"
        />
        <Label className="text-sm font-medium">Subscriptions</Label>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-background/95">
      <Switch
        checked={isSubscriptionMode}
        onCheckedChange={toggle}
        className="data-[state=checked]:bg-[#41c8d2]"
      />
      <Label className="font-medium">Subscriptions</Label>
    </div>
  );
}