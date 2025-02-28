/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPaymentMethods, deletePaymentMethod } from "@/lib/shopify/payment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

const CARD_ICONS: Record<string, string> = {
  visa: "/icons/visa.svg",
  mastercard: "/icons/mastercard.svg",
  amex: "/icons/amex.svg",
  discover: "/icons/discover.svg",
  default: "/icons/generic-card.svg",
};

export function PaymentMethods() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast.success("Payment method removed");
    },
    onError: () => {
      toast.error("Failed to remove payment method");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Card
          </Button>
        </div>

        {paymentMethods?.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No payment methods saved</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paymentMethods?.map((method: PaymentMethod) => (
              <Card key={method.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        CARD_ICONS[method.brand.toLowerCase()] ||
                        CARD_ICONS.default
                      }
                      alt={method.brand}
                      className="h-8 w-12 object-contain"
                    />
                    <div>
                      <p className="font-medium">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <span className="ml-2 rounded-full bg-[#f6424a]/10 px-2 py-1 text-xs font-medium text-[#f6424a]">
                        Default
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(method.id)}
                    disabled={deletingId === method.id}
                  >
                    {deletingId === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new card to your account for faster checkout.
            </DialogDescription>
          </DialogHeader>
          <div id="payment-form" className="min-h-[300px]"></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
