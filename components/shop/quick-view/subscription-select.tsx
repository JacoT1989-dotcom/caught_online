'use client';

import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const subscriptionOptions = [
  { value: 'monthly', label: 'Monthly', discount: 0.10 },
  { value: 'bimonthly', label: 'Every 2 Months', discount: 0.075 },
  { value: 'quarterly', label: 'Every 3 Months', discount: 0.05 },
];

interface SubscriptionSelectProps {
  value: string;
  onChange: (value: string) => void;
  price: number;
}

export function SubscriptionSelect({ value, onChange, price }: SubscriptionSelectProps) {
  const selectedOption = subscriptionOptions.find(opt => opt.value === value);
  const discountedPrice = price * (1 - (selectedOption?.discount || 0));

  return (
    <div className="space-y-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {subscriptionOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                <Badge className="bg-[#f6424a]/10 text-[#f6424a] border-[#f6424a]/20">
                  <Percent className="h-3 w-3 mr-1" />
                  Save {(option.discount * 100)}%
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="text-sm space-y-2">
        <div className="flex justify-between items-center">
          <span>Subscription price:</span>
          <span className="font-medium text-[#f6424a]">
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
    </div>
  );
}