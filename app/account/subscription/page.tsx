"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarRange,
  Package2,
  Settings2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerSubscriptions,
  Subscription,
} from "@/lib/shopify/subscriptions";
import { format, addMonths } from "date-fns";
import Image from "next/image";
import { SubscriptionSettings } from "@/components/account/subscription-settings";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);

  // Format customer ID if needed
  const getFormattedCustomerId = (): string => {
    if (!user?.id) return "";

    let formattedId = user.id;
    if (!formattedId.startsWith("gid://")) {
      formattedId = `gid://shopify/Customer/${formattedId}`;
    }
    return formattedId;
  };

  const {
    data: subscriptions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["subscriptions", user?.id],
    queryFn: () => getCustomerSubscriptions(getFormattedCustomerId()),
    enabled: !!user?.id,
  });

  const handleSubscriptionUpdate = () => {
    // Refetch data after settings update
    refetch();
    setIsSettingsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscriptions?.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Package2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                No Active Subscriptions
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Subscribe to your favorite products and save up to 10% on
                regular deliveries.
              </p>
            </div>
            <Button asChild className="mt-4 bg-[#f6424a] hover:bg-[#f6424a]/90">
              <a href="/products?subscription=true">
                Browse Subscription Products
              </a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription deliveries and settings
        </p>
      </div>

      <div className="grid gap-6">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    {subscription.product.image ? (
                      <Image
                        src={subscription.product.image}
                        alt={subscription.product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex items-center justify-center h-full w-full">
                        <Package2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {subscription.product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {subscription.interval === "monthly"
                          ? "Monthly"
                          : subscription.interval === "bimonthly"
                            ? "Every 2 Months"
                            : "Every 3 Months"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setCurrentSubscription(subscription);
                    setIsSettingsOpen(true);
                  }}
                >
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Button>
              </div>

              <Separator />

              {/* Details */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Next Delivery
                  </div>
                  <div className="font-medium">
                    {format(
                      new Date(subscription.nextDeliveryDate),
                      "MMM d, yyyy"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Price per Delivery
                  </div>
                  <div className="font-medium">
                    {formatPrice(parseFloat(subscription.price.amount))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Status
                  </div>
                  <div className="font-medium capitalize">
                    {subscription.status.toLowerCase()}
                  </div>
                </div>
              </div>

              {/* Next Deliveries */}
              <div>
                <h4 className="font-medium mb-3">Upcoming Deliveries</h4>
                <div className="grid gap-2">
                  {[...Array(3)].map((_, i) => {
                    const date = addMonths(
                      new Date(subscription.nextDeliveryDate),
                      i
                    );
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-[#41c8d2]" />
                          <span>{format(date, "MMMM d, yyyy")}</span>
                        </div>
                        {i === 0 && (
                          <span className="text-sm text-[#41c8d2]">
                            Next Delivery
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warning for Paused Subscriptions */}
              {subscription.status === "PAUSED" && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 text-yellow-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Subscription Paused</p>
                    <p>
                      Your subscription is currently paused. Resume anytime to
                      continue receiving deliveries.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {isSettingsOpen && currentSubscription && (
        <SubscriptionSettings
          subscription={currentSubscription}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={handleSubscriptionUpdate}
        />
      )}
    </div>
  );
}
