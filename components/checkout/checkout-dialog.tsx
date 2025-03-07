"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckout } from "@/hooks/use-checkout";
import { useCart, CartItem } from "@/hooks/use-cart";
import { useRegion, Region } from "@/hooks/use-region";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { createCheckout } from "@/lib/shopify/checkout";
import { Loader2 } from "lucide-react";

// Delivery fee constants based on regions
const DELIVERY_FEES: Record<Region | "default", number> = {
  "cape-town": 60,
  johannesburg: 70,
  pretoria: 65,
  durban: 75,
  default: 80, // Default fee if no region selected
};

interface FormData {
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export function CheckoutDialog(): JSX.Element {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentStep,
    setCurrentStep,
    resetCheckout,
  } = useCheckout();

  const { items, total: subtotal, clearCart } = useCart();
  const { selectedRegion } = useRegion();

  // Calculate delivery fee based on selected region
  const deliveryFee = selectedRegion
    ? DELIVERY_FEES[selectedRegion]
    : DELIVERY_FEES.default;

  // Calculate final total with delivery fee
  const total = subtotal + deliveryFee;

  // Debug logging to see if total is correctly calculated
  useEffect(() => {
    if (isCheckoutOpen) {
      console.log("Checkout opened with items:", items);
      console.log("Subtotal value:", subtotal);
      console.log("Selected region:", selectedRegion);
      console.log("Delivery fee:", deliveryFee);
      console.log("Final total:", total);
    }
  }, [isCheckoutOpen, items, subtotal, selectedRegion, deliveryFee, total]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      setIsLoading(true);

      // Import the function to get valid variant IDs
      const { getValidCartItems } = await import(
        "@/lib/shopify/product-variant"
      );

      // Get items with valid variant IDs from Shopify
      const processedItems = await getValidCartItems(items);

      // Log the processed items
      console.log(
        "Processed items for checkout:",
        JSON.stringify(processedItems, null, 2)
      );

      // Check if any items are still missing variant IDs
      const invalidItems = processedItems.filter((item) => !item.variantId);
      if (invalidItems.length > 0) {
        console.error("Some items still missing variant IDs:", invalidItems);
        throw new Error(
          "Some products could not be added to checkout. They might be unavailable."
        );
      }

      // Create checkout with the processed items
      const checkout = await createCheckout(processedItems);

      if (checkout?.webUrl) {
        // Generate a temporary order ID for tracking
        const tempOrderId = `temp-${Date.now()}`;

        // Track in dataLayer directly
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({
            event: "purchase",
            ecommerce: {
              transaction_id: tempOrderId,
              value: total,
              currency: "ZAR",
              items: processedItems.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity,
                currency: "ZAR",
              })),
            },
          });
        }

        // Track purchase in Meta Pixel
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("track", "Purchase", {
            value: total,
            currency: "ZAR",
            order_id: tempOrderId,
          });
        }

        // Use global function if available
        if (typeof window !== "undefined" && window.trackPurchase) {
          window.trackPurchase(total, tempOrderId);
        }

        // Redirect to Shopify checkout
        window.location.href = checkout.webUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast.error("Failed to create checkout", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      console.error("Checkout error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const stepTitles = [
    "Contact Information",
    "Shipping Address",
    "Review Order",
  ];

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <DialogContent
        className="sm:max-w-[500px]"
        aria-describedby="checkout-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>{stepTitles[currentStep - 1]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p
            id="checkout-dialog-description"
            className="text-sm text-muted-foreground"
          >
            Step {currentStep} of 3
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-medium">Order Summary</h3>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.title} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Delivery Fee (
                        {selectedRegion
                          ? selectedRegion.replace(/-/g, " ")
                          : "Standard"}
                        )
                      </span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 ml-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 3 ? (
                  "Proceed to Payment"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
