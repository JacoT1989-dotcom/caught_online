"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarRange, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateSubscriptionStatus,
  updateSubscriptionDetails,
} from "@/lib/shopify/subscriptions";

interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED";
  nextDeliveryDate: string;
  interval: string;
  product: {
    title: string;
    image: string;
  };
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface SubscriptionSettingsProps {
  subscription: Subscription;
  onClose: () => void;
}

export function SubscriptionSettings({
  subscription,
  onClose,
}: SubscriptionSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(subscription.nextDeliveryDate)
  );
  const [selectedInterval, setSelectedInterval] = useState(
    subscription.interval
  );

  const handleStatusUpdate = async (newStatus: "ACTIVE" | "PAUSED") => {
    setIsUpdating(true);
    try {
      await updateSubscriptionStatus(subscription.id, newStatus);
      toast.success(
        newStatus === "ACTIVE"
          ? "Subscription resumed successfully"
          : "Subscription paused successfully"
      );
      onClose();
    } catch (error) {
      toast.error("Failed to update subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedDate) return;

    setIsUpdating(true);
    try {
      // This function needs to be implemented in your API service
      await updateSubscriptionDetails(subscription.id, {
        interval: selectedInterval,
        nextDeliveryDate: format(selectedDate, "yyyy-MM-dd"),
      });
      toast.success("Subscription settings updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update subscription settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisabledDates = (date: Date) => {
    // Disable dates in the past
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscription Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Delivery Frequency */}
          <div className="space-y-4">
            <Label>Delivery Frequency</Label>
            <RadioGroup
              value={selectedInterval}
              onValueChange={setSelectedInterval}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex items-center gap-2">
                  Monthly
                  <span className="text-sm text-muted-foreground">
                    (Save 10%)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bimonthly" id="bimonthly" />
                <Label htmlFor="bimonthly" className="flex items-center gap-2">
                  Every 2 Months
                  <span className="text-sm text-muted-foreground">
                    (Save 7.5%)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly" className="flex items-center gap-2">
                  Every 3 Months
                  <span className="text-sm text-muted-foreground">
                    (Save 5%)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Next Delivery Date */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              Next Delivery Date
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={handleDisabledDates}
              className="rounded-md border"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>

            <div className="flex gap-3">
              {/* Save Changes button */}
              <Button
                className="bg-[#41c8d2] hover:bg-[#41c8d2]/90"
                onClick={handleSaveChanges}
                disabled={isUpdating || !selectedDate}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              {/* Pause/Resume button */}
              {subscription.status === "ACTIVE" ? (
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate("PAUSED")}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pausing...
                    </>
                  ) : (
                    "Pause"
                  )}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate("ACTIVE")}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resuming...
                    </>
                  ) : (
                    "Resume"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
