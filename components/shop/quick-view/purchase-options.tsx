'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { SubscriptionSelect } from './subscription-select';

interface PurchaseOptionsProps {
  price: number;
  purchaseType: 'onetime' | 'subscription';
  onPurchaseTypeChange: (value: 'onetime' | 'subscription') => void;
  subscriptionInterval: string;
  onSubscriptionIntervalChange: (value: string) => void;
}

export function PurchaseOptions({
  price,
  purchaseType,
  onPurchaseTypeChange,
  subscriptionInterval,
  onSubscriptionIntervalChange,
}: PurchaseOptionsProps) {
  return (
    <div className="space-y-4">
      <RadioGroup 
        value={purchaseType} 
        onValueChange={(value: 'onetime' | 'subscription') => onPurchaseTypeChange(value)}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="onetime" id="onetime" />
            <div className="grid gap-1.5">
              <Label htmlFor="onetime">One-time purchase</Label>
              <p className="text-sm text-muted-foreground">
                {formatPrice(price)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="subscription" id="subscription" />
            <div className="grid gap-1.5">
              <Label htmlFor="subscription">Subscribe & Save</Label>
              <p className="text-sm text-muted-foreground">
                Save up to 10% and never run out
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>

      {/* Show subscription options by default but conditionally enable them */}
      <div className={`pl-6 transition-opacity duration-200 ${purchaseType === 'subscription' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <SubscriptionSelect
          value={subscriptionInterval}
          onChange={onSubscriptionIntervalChange}
          price={price}
        />
      </div>
    </div>
  );
}