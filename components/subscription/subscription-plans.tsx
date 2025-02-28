'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSubscriptionToggle } from '@/hooks/use-subscription-toggle';
import { SUBSCRIPTION_PLANS, type SubscriptionInterval } from '@/lib/constants/subscription';

export function SubscriptionPlans() {
  const router = useRouter();
  const { toggle, setInterval } = useSubscriptionToggle();

  const handleSubscribe = (interval: SubscriptionInterval) => {
    setInterval(interval);
    toggle();
    router.push('/products');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
        <Card key={key} className="relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f6424a] to-[#f6424a]/50" />
          <div className="p-6 flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">{plan.label}</h3>
              <div className="mt-2 text-3xl font-bold text-[#f6424a]">
                {(plan.discount * 100)}% Off
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Get fresh seafood delivered {plan.label.toLowerCase()}</p>
            </div>

            <div className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{(plan.discount * 100)}% off every order</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Free delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Priority access to new products</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Flexible delivery dates</span>
                </li>
              </ul>
            </div>

            <Button 
              className="w-full mt-6 bg-[#f6424a] hover:bg-[#f6424a]/90"
              onClick={() => handleSubscribe(key as SubscriptionInterval)}
            >
              Subscribe Now
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}