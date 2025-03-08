"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionInterval,
} from "@/lib/constants/subscription";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function SubscriptionPlans() {
  const router = useRouter();
  const { user } = useAuth();
  const { toggle, setInterval } = useSubscriptionToggle();
  const [loadingInterval, setLoadingInterval] =
    useState<SubscriptionInterval | null>(null);

  const handleSubscribe = async (interval: SubscriptionInterval) => {
    // Set loading state
    setLoadingInterval(interval);

    try {
      // First set the interval in the toggle state
      setInterval(interval);

      // Then enable subscription mode
      toggle();

      // If user is not logged in, redirect to login
      if (!user?.id) {
        toast.info("Please log in to continue with your subscription");
        router.push(`/login?redirect=/products?subscription=${interval}`);
        return;
      }

      // Navigate to products page with subscription parameter
      // This ensures the navbar toggle will pick up the subscription
      router.push(`/products?subscription=${interval}`);

      // Show confirmation toast
      toast.success(
        `${SUBSCRIPTION_PLANS[interval].label} subscription selected`,
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("Error during subscription flow:", error);
      toast.error(
        "There was a problem with your subscription. Please try again."
      );
    } finally {
      setLoadingInterval(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
        const interval = key as SubscriptionInterval;
        const isLoading = loadingInterval === interval;

        return (
          <Card
            key={key}
            className="relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f6424a] to-[#f6424a]/50" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">{plan.label}</h3>
                <div className="mt-2 text-3xl font-bold text-[#f6424a]">
                  {plan.discount * 100}% Off
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get fresh seafood delivered {plan.label.toLowerCase()}
                </p>
              </div>
              <div className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.discount * 100}% off every order
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Free delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      Priority access to new products
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Flexible delivery dates</span>
                  </li>
                </ul>
              </div>
              <Button
                className="w-full mt-6 bg-[#f6424a] hover:bg-[#f6424a]/90"
                onClick={() => handleSubscribe(interval)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
