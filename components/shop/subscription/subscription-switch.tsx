'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SubscriptionSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: 'default' | 'compact';
}

export function SubscriptionSwitch({ checked, onCheckedChange, variant = 'default' }: SubscriptionSwitchProps) {
  return (
    <div className={cn(
      "flex items-center gap-2",
      variant === 'compact' ? "px-2 h-10 rounded-md border w-full bg-background/95" : "p-2 rounded-md border bg-background/95"
    )}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#41c8d2]"
      />
      <Label className={cn(
        "font-medium",
        variant === 'compact' && "text-sm"
      )}>
        Subscriptions
      </Label>
    </div>
  );
}