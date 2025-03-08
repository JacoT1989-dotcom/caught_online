"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  Loader2,
  PauseCircle,
  PlayCircle,
  Package2,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCustomerSubscriptions,
  updateSubscriptionStatus,
  Subscription,
} from "@/lib/shopify/subscriptions";
import Image from "next/image";

interface SubscriptionsListProps {
  customerId: string;
}

export function SubscriptionsList({ customerId }: SubscriptionsListProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!customerId) return;

      console.log("Fetching subscriptions for customer:", customerId);
      setError(null);

      try {
        // Format customer ID if needed
        let formattedId = customerId;
        if (!formattedId.startsWith("gid://")) {
          formattedId = `gid://shopify/Customer/${customerId}`;
          console.log("Formatted customer ID:", formattedId);
        }

        const data = await getCustomerSubscriptions(formattedId);
        console.log("Subscription data received:", data);
        setSubscriptions(data);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions. Please try again later.");
        toast.error("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [customerId]);

  const handleStatusUpdate = async (
    subscription: Subscription,
    newStatus: "ACTIVE" | "PAUSED"
  ) => {
    setSelectedSubscription(subscription);
    setShowConfirmDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedSubscription) return;

    setUpdating(true);
    try {
      const newStatus =
        selectedSubscription.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await updateSubscriptionStatus(selectedSubscription.id, newStatus);

      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubscription.id
            ? { ...sub, status: newStatus }
            : sub
        )
      );

      toast.success(
        `Subscription ${newStatus.toLowerCase() === "active" ? "resumed" : "paused"} successfully`
      );
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    } finally {
      setUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 text-lg font-medium">
          Error Loading Subscriptions
        </h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Package2 className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No active subscriptions</h3>
        <p className="text-muted-foreground">
          Subscribe to your favorite products for regular delivery and save.
        </p>
        <Button asChild className="mt-6">
          <a href="/products?filter=subscription">
            Browse Subscription Products
          </a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
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
              <div className="flex-1">
                <h3 className="font-semibold">{subscription.product.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <p>
                    Delivery:{" "}
                    {subscription.interval === "monthly"
                      ? "Monthly"
                      : subscription.interval === "bimonthly"
                        ? "Every 2 Months"
                        : subscription.interval === "quarterly"
                          ? "Every 3 Months"
                          : subscription.interval}
                  </p>
                  <p>
                    Next delivery:{" "}
                    {new Date(
                      subscription.nextDeliveryDate
                    ).toLocaleDateString()}
                  </p>
                  <p>{formatPrice(parseFloat(subscription.price.amount))}</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button
                  variant={
                    subscription.status === "ACTIVE" ? "destructive" : "default"
                  }
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                  onClick={() =>
                    handleStatusUpdate(
                      subscription,
                      subscription.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
                    )
                  }
                >
                  {subscription.status === "ACTIVE" ? (
                    <>
                      <PauseCircle className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {selectedSubscription?.status === "ACTIVE" ? "pause" : "resume"}{" "}
              this subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
