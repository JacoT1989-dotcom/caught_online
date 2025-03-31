// Fixed the nested button issue in the CardFooter section

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Package,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addMonths } from "date-fns";
import {
  SubscriptionFlowService,
  Subscription,
} from "@/lib/subscriptionService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import SubscriptionDetailsModal from "./SubscriptionDetailsModal";

export const SubscriptionManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [suspendOption, setSuspendOption] = useState<string>("Today");
  const [resumeOption, setResumeOption] = useState<string>("Today");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  // Use auth hook to get current user
  const { user } = useAuth();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user's information from auth
      const { email, shopifyId, customerNumber } = getUserDetails();

      if (!email && !shopifyId && !customerNumber) {
        throw new Error("No user identification available");
      }

      let subscriptionsData: Subscription[] = [];

      // Prioritize email for security reasons - it's more reliable for identifying the correct user
      if (email) {
        subscriptionsData =
          await SubscriptionFlowService.getSubscriptionsByEmail(email);
      } else if (customerNumber) {
        subscriptionsData =
          await SubscriptionFlowService.getSubscriptionsByCustomerNumber(
            customerNumber
          );
      } else if (shopifyId) {
        subscriptionsData = await SubscriptionFlowService.getSubscriptions(
          shopifyId
        );
      }

      setSubscriptions(subscriptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user details from the auth context
  const getUserDetails = () => {
    let email = "";
    let shopifyId = "";
    let customerNumber = "";

    if (user) {
      // Get email if available
      if (user.email) {
        email = user.email;
      }

      // Get ID if available
      if (user.id) {
        shopifyId = String(user.id);
      }

      // If there's a customer number field, get that too
      if (user.customerNumber) {
        customerNumber = user.customerNumber;
      }

      // Check if ID looks like a customer number (CUST_X format)
      if (shopifyId && shopifyId.startsWith("CUST_")) {
        customerNumber = shopifyId;
      }
    }

    return {
      email,
      shopifyId,
      customerNumber,
    };
  };

  const handleSuspendSubscription = async () => {
    if (!selectedSubscription) return;

    setIsProcessing(true);
    try {
      await SubscriptionFlowService.suspendSubscription(
        selectedSubscription.id,
        suspendOption,
        suspendOption === "Specific Date" ? selectedDate : undefined
      );

      toast({
        title: "Subscription Paused",
        description: `Your ${selectedSubscription.name} subscription has been paused.`,
      });

      // Refresh subscription data
      await fetchSubscriptions();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to pause your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedSubscription(null);
    }
  };

  const handleResumeSubscription = async () => {
    if (!selectedSubscription) return;

    setIsProcessing(true);
    try {
      await SubscriptionFlowService.resumeSubscription(
        selectedSubscription.id,
        resumeOption,
        resumeOption === "Specific Date" ? selectedDate : undefined
      );

      toast({
        title: "Subscription Resumed",
        description: `Your ${selectedSubscription.name} subscription has been resumed.`,
      });

      // Refresh subscription data
      await fetchSubscriptions();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resume your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedSubscription(null);
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format the display name into a more readable format
  const formatDisplayName = (displayName: string) => {
    if (!displayName) return "";

    // Split the display name by the arrow if it exists
    const parts = displayName.split("->");

    if (parts.length > 1) {
      // Return the second part (after the arrow)
      return parts[1].trim();
    }

    return displayName;
  };

  // Get next billing date in a readable format
  const getNextBillingDate = (subscription: Subscription) => {
    if (subscription.next_bill_date) {
      return format(new Date(subscription.next_bill_date), "MMM dd, yyyy");
    } else if (subscription.created_at) {
      // Estimate based on renewal type if next_bill_date is not available
      const startDate = new Date(subscription.created_at);

      if (subscription.renewal_type.toLowerCase().includes("month")) {
        return format(addMonths(startDate, 1), "MMM dd, yyyy");
      }

      return "Unknown";
    }

    return "Unknown";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <AlertCircle className="text-red-500 mb-2" size={24} />
        <p className="text-red-500 mb-2">{error}</p>
        <Button onClick={fetchSubscriptions} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center p-8">
        <p className="text-gray-500 mb-4">
          You don&apos;t have any active subscriptions.
        </p>
      </div>
    );
  }

  // Subscriptions list
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Subscriptions</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubscriptions}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="space-y-6">
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{subscription.name}</CardTitle>
                <CardDescription className="mt-1">
                  {subscription.display_name
                    ? formatDisplayName(subscription.display_name)
                    : `${subscription.type} · ${subscription.renewal_type} billing`}
                </CardDescription>
              </div>
              <Badge className={getBadgeStyle(subscription.status)}>
                {subscription.status}
              </Badge>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Started:{" "}
                      {format(
                        new Date(subscription.created_at),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>

                  {subscription.billing_end_date && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        Ends:{" "}
                        {format(
                          new Date(subscription.billing_end_date),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}

                  {subscription.suspended_at && (
                    <div className="flex items-center text-sm text-amber-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        Paused since:{" "}
                        {format(
                          new Date(subscription.suspended_at),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-semibold">
                      R{subscription.total_amount.toFixed(2)} /{" "}
                      {subscription.renewal_type.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Next billing: {getNextBillingDate(subscription)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {subscription.is_auto_renew
                        ? "Auto-renews"
                        : "Manual renewal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product details (parsed from display_name if available) */}
              {subscription.display_name && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Product Details</h4>
                  <p className="text-sm text-gray-700">
                    {formatDisplayName(subscription.display_name)}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex justify-between items-center flex-wrap">
              <div>
                {subscription.status.toLowerCase() === "active" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        Pause Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Pause Subscription</DialogTitle>
                        <DialogDescription>
                          Your subscription will be paused and you won&apos;t be
                          charged during this period.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            When would you like to pause?
                          </p>
                          <Select
                            value={suspendOption}
                            onValueChange={(value) => {
                              setSuspendOption(value);
                              // Reset selected date when changing options
                              if (value !== "Specific Date") {
                                setSelectedDate(undefined);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select when to pause" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Today">Today</SelectItem>
                              <SelectItem value="End of Last Invoice Period">
                                End of Current Billing Period
                              </SelectItem>
                              <SelectItem value="End of Current Term">
                                End of Current Term
                              </SelectItem>
                              <SelectItem value="Specific Date">
                                Choose a Specific Date
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Add conditional date input */}
                          {suspendOption === "Specific Date" && (
                            <div className="space-y-2 mt-2">
                              <p className="text-sm font-medium">Select Date</p>
                              <input
                                title="select date"
                                placeholder="Select date"
                                type="date"
                                value={selectedDate || ""}
                                onChange={(e) =>
                                  setSelectedDate(e.target.value)
                                }
                                className="w-full rounded-md border border-input px-3 py-2"
                                min={new Date().toISOString().split("T")[0]} // Only allow future dates
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubscription(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSuspendSubscription}
                          disabled={
                            isProcessing ||
                            (suspendOption === "Specific Date" && !selectedDate)
                          }
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Pause Subscription"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : subscription.status.toLowerCase() === "suspended" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        Resume Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Resume Subscription</DialogTitle>
                        <DialogDescription>
                          Your subscription will be reactivated and billing will
                          restart.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            When would you like to resume?
                          </p>
                          <Select
                            value={resumeOption}
                            onValueChange={(value) => {
                              setResumeOption(value);
                              // Reset selected date when changing options
                              if (value !== "Specific Date") {
                                setSelectedDate(undefined);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select when to resume" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Today">Today</SelectItem>
                              <SelectItem value="Specific Date">
                                Choose a Specific Date
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Add conditional date input */}
                        {resumeOption === "Specific Date" && (
                          <div className="space-y-2 mt-2">
                            <p className="text-sm font-medium">Select Date</p>
                            <input
                              title="select date"
                              placeholder="Select date"
                              type="date"
                              value={selectedDate || ""}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full rounded-md border border-input px-3 py-2"
                              min={new Date().toISOString().split("T")[0]} // Only allow future dates
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubscription(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleResumeSubscription}
                          disabled={
                            isProcessing ||
                            (resumeOption === "Specific Date" && !selectedDate)
                          }
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Resume Subscription"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>

              {/* FIXED: Remove the Button wrapper around SubscriptionDetailsModal */}
              <div className="text-gray-500">
                <SubscriptionDetailsModal subscription={subscription} />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
