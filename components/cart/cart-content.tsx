"use client";

import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { CartItem } from "./cart-item";
import { ShippingProgress } from "./shipping-progress";
import { CouponInput } from "./coupon-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Package2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants/cart";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { trackInitiateCheckout } from "@/lib/analytics";

interface CartContentProps {
  onClose: () => void;
}

export function CartContent({ onClose }: CartContentProps) {
  const { items } = useCart();
  const { setIsCheckoutOpen } = useCheckout();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    return isNaN(itemTotal) ? total : total + itemTotal;
  }, 0);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : null;
  const total = subtotal + (shipping || 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-4 rounded-full bg-[#f6424a]/5 mb-4">
          <Package2 className="h-8 w-8 text-[#f6424a]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your Fishbox is Empty</h3>
        <p className="text-muted-foreground mb-8">
          Add some delicious seafood to get started
        </p>
        <Button
          asChild
          className="bg-[#f6424a] hover:bg-[#f6424a]/90 min-w-[200px]"
          onClick={onClose}
        >
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar - Desktop Only */}
      {isDesktop && (
        <div className="sticky top-0 z-10 bg-background border-b">
          <ShippingProgress subtotal={subtotal} />
        </div>
      )}

      {/* Scrollable Items */}
      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-4">
          {items.map((item) => (
            <CartItem key={`${item.id}-${item.quantity}`} item={item} />
          ))}
        </div>
      </ScrollArea>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 bg-background border-t p-4 space-y-4">
        {/* Coupon Input */}
        <CouponInput
          onApply={(discount) => {
            // Handle discount application
          }}
          onRemove={() => {
            // Handle discount removal
          }}
        />

        {/* Price Breakdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal</span>
            <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm">Shipping</span>
            <span className="text-sm">
              {shipping === 0 ? "Free" : "Calculated at checkout"}
            </span>
          </div>

          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          className="w-full bg-[#f6424a] hover:bg-[#f6424a]/90"
          onClick={() => {
            onClose();
            setIsCheckoutOpen(true);

            trackInitiateCheckout(total, items);
            if (typeof window !== "undefined" && window.trackInitiateCheckout) {
              window.trackInitiateCheckout(total);
            }

            onClose();
            setIsCheckoutOpen(true);
          }}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
