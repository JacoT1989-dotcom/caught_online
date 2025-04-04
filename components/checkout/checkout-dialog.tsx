"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCheckout } from "@/hooks/use-checkout";
import { useRegion, Region } from "@/hooks/use-region";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { createCheckout } from "@/lib/shopify/checkout";
import { Loader2, ArrowLeft, ShoppingCart, CreditCard } from "lucide-react";
import { trackFormSubmit } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

// Delivery fee constants based on regions
const DELIVERY_FEES: Record<Region | "default", number> = {
  "cape-town": 85,
  johannesburg: 85,
  pretoria: 85,
  durban: 85,
  default: 85, // Default fee if no region selected
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
  const router = useRouter();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentStep,
    setCurrentStep,
    resetCheckout,
  } = useCheckout();

  const { items, clearCart } = useCart();
  const { selectedRegion } = useRegion();
  const { user, isAuthenticated } = useAuth();

  // Calculate subtotal directly from cart items
  const calculateSubtotal = (): number => {
    return items.reduce((total, item) => {
      // Ensure we're working with numbers
      const price =
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price));
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseFloat(String(item.quantity));
      return total + price * quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Calculate delivery fee based on selected region
  const deliveryFee = selectedRegion
    ? DELIVERY_FEES[selectedRegion]
    : DELIVERY_FEES.default;

  // Calculate total (subtotal + delivery fee)
  const total = subtotal + deliveryFee;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create new form data without referencing the current formData state
      const newFormData = {
        email: user.email || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: user.phone || "",
        address: "",
        city: "",
        postalCode: "",
      };

      // Check if user has a default address
      if (user.defaultAddress) {
        // Fill in address details from default address
        newFormData.address = user.defaultAddress.address1;
        if (user.defaultAddress.address2) {
          newFormData.address += `, ${user.defaultAddress.address2}`;
        }
        newFormData.city = user.defaultAddress.city;
        newFormData.postalCode = user.defaultAddress.zip;
      }

      setFormData(newFormData);
    }
  }, [isAuthenticated, user, isCheckoutOpen]);

  // New function to handle redirection to payment
  const handlePaymentRedirect = () => {
    if (checkoutUrl) {
      // Redirect to the external payment URL
      window.location.href = checkoutUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }
    trackFormSubmit("Checkout Form");
    try {
      setIsLoading(true);

      // Import the function to get valid variant IDs
      const { getValidCartItems } = await import(
        "@/lib/shopify/product-variant"
      );

      // Get items with valid variant IDs from Shopify
      const processedItems = await getValidCartItems(items);

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

        // Store the payment URL
        setCheckoutUrl(checkout.webUrl);

        // Show payment step
        setIsProcessingPayment(true);

        // Toast notification
        toast.success("Order details confirmed!", {
          description: "Proceeding to payment...",
        });
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

  const handleReturnToSite = () => {
    // Close the checkout dialog
    setIsCheckoutOpen(false);

    // Reset checkout state for future use
    resetCheckout();

    // Redirect to home page
    router.push("/");
  };

  const stepTitles = [
    "Contact Information",
    "Shipping Address",
    "Review Order",
    "Payment",
  ];

  // Order summary to display on all steps
  const OrderSummary = () => (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} in cart
          </p>
          <h4 className="text-lg font-medium">Order Total:</h4>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Including delivery</p>
          <p className="text-2xl font-bold text-cyan-600">
            {formatPrice(total)}
          </p>
        </div>
      </div>
    </div>
  );

  // CSS for custom scrollbar - will be applied within a style tag
  const customScrollbarStyle = `
    .modern-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    
    .modern-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .modern-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    
    .modern-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* For Firefox */
    .modern-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
  `;

  return (
    <>
      <style jsx global>
        {customScrollbarStyle}
      </style>
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-hidden"
          aria-describedby="checkout-dialog-description"
        >
          {!isProcessingPayment ? (
            <>
              <DialogHeader className="sticky top-0 z-10 bg-white pb-4 mb-2">
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {stepTitles[currentStep - 1]}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[calc(70vh-120px)] overflow-y-auto modern-scrollbar pr-1">
                <div className="flex items-center gap-2 sticky top-0 bg-white pb-4 mb-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`rounded-full h-8 w-8 flex items-center justify-center 
                          ${
                            currentStep === step
                              ? "bg-cyan-600 text-white"
                              : currentStep > step
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                      >
                        {currentStep > step ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      {step < 3 && (
                        <div
                          className={`h-1 w-4 ${
                            currentStep > step ? "bg-cyan-600" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>

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
                      <OrderSummary />
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
                      <OrderSummary />
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div className="rounded-lg border p-4 space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Order Summary
                        </h3>

                        <div className="max-h-[30vh] overflow-y-auto modern-scrollbar pr-1">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm py-2 border-b"
                            >
                              <div className="flex-1">
                                <span className="font-medium">
                                  {item.title} x {item.quantity}
                                </span>
                                <div className="text-muted-foreground text-xs">
                                  {formatPrice(item.price)} each
                                </div>
                              </div>
                              <span>
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 space-y-2">
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
                          <div className="flex justify-between font-medium mt-4 pt-2 border-t">
                            <span className="text-lg">Total</span>
                            <span className="text-xl font-bold text-cyan-600">
                              {formatPrice(total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4 space-y-3">
                        <h3 className="font-medium">Customer Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p>{formData.name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Email:
                            </span>
                            <p>{formData.email}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Phone:
                            </span>
                            <p>{formData.phone}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Delivery Address:
                          </span>
                          <p>
                            {formData.address}, {formData.city},{" "}
                            {formData.postalCode}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </div>

              <div className="pt-4 border-t mt-4 bg-white">
                <div className="flex justify-between">
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
                    onClick={handleSubmit}
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
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </DialogTitle>
              </DialogHeader>

              <div className="py-6 text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium">Ready for Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Your order details have been confirmed. Click the button below
                  to proceed to our secure payment gateway.
                </p>

                <div className="mt-4 p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount Due
                  </p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {formatPrice(total)}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-2">
                <Button
                  onClick={handlePaymentRedirect}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </Button>
                <Button
                  onClick={handleReturnToSite}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
