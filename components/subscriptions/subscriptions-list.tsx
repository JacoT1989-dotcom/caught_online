"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, Loader2, PauseCircle, PlayCircle } from "lucide-react";
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
} from "@/lib/shopify/subscriptions";
import Image from "next/image";

interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  nextDeliveryDate: string;
  product: {
    title: string;
    image: string;
  };
  interval: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

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

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const data = await getCustomerSubscriptions(customerId);
        setSubscriptions(data);
      } catch (error) {
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

      toast.success("Subscription updated successfully");
    } catch (error) {
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

  if (!subscriptions.length) {
    return (
      <div className="text-center py-12">
        <CalendarRange className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No active subscriptions</h3>
        <p className="text-muted-foreground">
          Subscribe to your favorite products for regular delivery and save.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="p-6">
            <div className="flex items-center gap-6">
              <Image
                src={subscription.product.image}
                alt={subscription.product.title}
                width={80}
                height={80}
                className="object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{subscription.product.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <p>Delivery: {subscription.interval}</p>
                  <p>
                    Next delivery:{" "}
                    {new Date(
                      subscription.nextDeliveryDate
                    ).toLocaleDateString()}
                  </p>
                  <p>{formatPrice(parseFloat(subscription.price.amount))}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2"
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
