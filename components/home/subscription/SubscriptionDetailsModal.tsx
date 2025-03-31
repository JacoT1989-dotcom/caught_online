import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CreditCard,
  Package,
  Tag,
  User,
  FileText,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "@/lib/subscriptionService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SubscriptionDetailsModalProps {
  subscription: Subscription;
  trigger?: React.ReactNode; // Optional custom trigger
}

export const SubscriptionDetailsModal: React.FC<
  SubscriptionDetailsModalProps
> = ({ subscription, trigger }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // Helper to get subscription status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format the display name into a more readable format
  const formatDisplayName = (displayName: string | undefined) => {
    if (!displayName) return "";
    const parts = displayName.split("->");
    return parts.length > 1 ? parts[1].trim() : displayName;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-500">
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Subscription Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your subscription plan and billing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Subscription Header Information */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">{subscription.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDisplayName(subscription.display_name)}
              </p>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.status}
            </Badge>
          </div>

          {/* Main Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium border-b pb-1">
                Subscription Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Type:</span>
                  <span>{subscription.type}</span>
                </div>

                <div className="flex items-center text-sm">
                  <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Renewal:</span>
                  <span>{subscription.renewal_type}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Package className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Auto-renew:</span>
                  <span>{subscription.is_auto_renew ? "Yes" : "No"}</span>
                </div>

                {subscription.id && (
                  <div className="flex items-start text-sm">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <span className="font-medium mr-2">Subscription ID:</span>
                      <span className="text-xs text-gray-500 break-all">
                        {subscription.id}
                      </span>
                    </div>
                  </div>
                )}

                {subscription.customer_email && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Account:</span>
                    <span>{subscription.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium border-b pb-1">
                Billing Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(subscription.total_amount)} /{" "}
                    {subscription.renewal_type.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Started:</span>
                  <span>{formatDate(subscription.created_at)}</span>
                </div>

                {subscription.next_bill_date && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Next billing:</span>
                    <span>{formatDate(subscription.next_bill_date)}</span>
                  </div>
                )}

                {subscription.billing_end_date && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">End date:</span>
                    <span>{formatDate(subscription.billing_end_date)}</span>
                  </div>
                )}

                {subscription.suspended_at && (
                  <div className="flex items-center text-sm text-amber-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium mr-2">Paused since:</span>
                    <span>{formatDate(subscription.suspended_at)}</span>
                  </div>
                )}

                {subscription.cancelled_at && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium mr-2">Cancelled on:</span>
                    <span>{formatDate(subscription.cancelled_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Items */}
          {subscription.items && subscription.items.length > 0 && (
            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="items">
                <AccordionTrigger className="text-sm font-medium">
                  Subscription Items
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Product ID</TableHead>
                        {subscription.items[0].price && (
                          <TableHead className="text-right">Price</TableHead>
                        )}
                        {subscription.items[0].quantity && (
                          <TableHead className="text-right">Quantity</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscription.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.name ||
                              item.product_id ||
                              `Item ${index + 1}`}
                          </TableCell>
                          <TableCell>{item.product_id || "N/A"}</TableCell>
                          {item.price && (
                            <TableCell className="text-right">
                              {typeof item.price === "number"
                                ? formatCurrency(item.price)
                                : item.price}
                            </TableCell>
                          )}
                          {item.quantity && (
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Additional Details */}
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="additional">
              <AccordionTrigger className="text-sm font-medium">
                Additional Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">Last updated:</span>
                    <span className="text-gray-600">
                      {formatDate(subscription.updated_at)}
                    </span>
                  </div>

                  {subscription.payment_status && (
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">Payment status:</span>
                      <span className="text-gray-600">
                        {subscription.payment_status}
                      </span>
                    </div>
                  )}

                  {subscription.customer_id && (
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">Customer ID:</span>
                      <span className="text-gray-600 break-all">
                        {subscription.customer_id}
                      </span>
                    </div>
                  )}

                  {subscription.customer_number && (
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">Customer number:</span>
                      <span className="text-gray-600">
                        {subscription.customer_number}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailsModal;
