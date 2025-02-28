'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIPTION_PLANS } from '@/lib/types/subscription';
import { cn } from '@/lib/utils';

interface SubscriptionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SubscriptionSelect({ value, onValueChange, className }: SubscriptionSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "w-full border transition-colors duration-200",
        "border-[#41c8d2]/20 bg-[#41c8d2]/5",
        className
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
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}