"use client";

import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/types/subscription";
import type { SubscriptionInterval } from "@/lib/types/subscription";
import { cn } from "@/lib/utils";
import { Percent, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { handleSubscriptionFlow } from "../subscriptionflow/handler";
import {
  trackSubscription,
  trackAddToCart,
  trackSelectItem,
} from "@/lib/analytics";

// Define a type for subscription variant IDs by interval
interface SubscriptionVariantIds {
  monthly: string;
  bimonthly: string;
  quarterly: string;
}

interface SubscriptionOptionsProps {
  price: number;
  purchaseType: "onetime" | "subscription";
  onPurchaseTypeChange: (value: "onetime" | "subscription") => void;
  subscriptionInterval: SubscriptionInterval;
  onSubscriptionIntervalChange: (value: SubscriptionInterval) => void;
  onAddToCart: () => void;
  isAvailable?: boolean;
  productId: string; // The base product ID (not variant ID)
  productTitle?: string; // Added product title for better tracking
  subscriptionVariantIds: SubscriptionVariantIds; // Variant IDs for subscription options
  quantity?: number;
  useSubscriptionFlow?: boolean;
}

export function SubscriptionOptions({
  price,
  purchaseType,
  onPurchaseTypeChange,
  subscriptionInterval,
  onSubscriptionIntervalChange,
  onAddToCart,
  isAvailable = true,
  productId,
  productTitle = "Product", // Default to "Product" if title not provided
  subscriptionVariantIds,
  quantity = 1,
  useSubscriptionFlow = true,
}: SubscriptionOptionsProps) {
  const [showAllOptions, setShowAllOptions] = useState(false);
  const selectedOption = SUBSCRIPTION_PLANS[subscriptionInterval];
  const discountedPrice = price * (1 - (selectedOption?.discount || 0));

  // Handle the Add to Cart button click
  const handleAddToCart = () => {
    onPurchaseTypeChange("onetime");

    // Track add to cart using the analytics module
    trackAddToCart({
      id: productId,
      title: productTitle,
      price: price,
      quantity: quantity,
      variantId: "", // One-time purchase may not have a variant ID
    });

    onAddToCart();
  };

  // Track when user changes subscription interval
  const handleIntervalChange = (value: SubscriptionInterval) => {
    // Track interval selection
    trackSelectItem(
      {
        id: subscriptionVariantIds[value] || productId,
        title: `${productTitle} - ${value} subscription`,
        price: price * (1 - (SUBSCRIPTION_PLANS[value]?.discount || 0)),
        quantity: quantity,
        variantId: subscriptionVariantIds[value],
      },
      "Subscription Options"
    );

    onSubscriptionIntervalChange(value);
  };

  // Track when user changes purchase type
  const handlePurchaseTypeChange = (value: "onetime" | "subscription") => {
    onPurchaseTypeChange(value);

    if (value === "subscription") {
      setShowAllOptions(true);

      // Track when user selects subscription option
      trackSelectItem(
        {
          id: subscriptionVariantIds[subscriptionInterval] || productId,
          title: `${productTitle} - Subscription`,
          price: discountedPrice,
          quantity: quantity,
          variantId: subscriptionVariantIds[subscriptionInterval],
        },
        "Purchase Options"
      );
    } else {
      // Track when user selects one-time purchase
      trackSelectItem(
        {
          id: productId,
          title: `${productTitle} - One-time purchase`,
          price: price,
          quantity: quantity,
        },
        "Purchase Options"
      );
    }
  };

  // Handle the Subscribe Now button click
  const handleSubscribeNow = () => {
    onPurchaseTypeChange("subscription");

    // Track subscription purchase
    trackSubscription(
      `${subscriptionInterval}-subscription`,
      discountedPrice * quantity
    );

    // Also track as a standard purchase for compatibility with other analytics
    trackAddToCart({
      id: subscriptionVariantIds[subscriptionInterval] || productId,
      title: `${productTitle} - ${subscriptionInterval} subscription`,
      price: discountedPrice,
      quantity: quantity,
      variantId: subscriptionVariantIds[subscriptionInterval],
    });

    if (useSubscriptionFlow) {
      // Ensure we're using the correct variant ID for the selected interval
      const currentVariantId = subscriptionVariantIds[subscriptionInterval];

      if (!currentVariantId) {
        console.error(
          `No variant ID found for interval: ${subscriptionInterval}`
        );
        return;
      }

      // Use subscription flow for checkout with the product-specific variant IDs
      handleSubscriptionFlow({
        productId,
        subscriptionVariantIds,
        selectedInterval: subscriptionInterval,
        quantity,
      });
    } else {
      // Use your existing cart functionality
      onAddToCart();
    }
  };

  return (
    <div className="space-y-6">
      {/* One-time Purchase Option */}
      <div>
        <button
          type="button"
          onClick={() => handlePurchaseTypeChange("onetime")}
          className={cn(
            "w-full text-left transition-colors duration-200",
            "rounded-lg border p-4",
            purchaseType === "onetime"
              ? "border-[#41c8d2] bg-[#41c8d2]/5"
              : "hover:border-[#41c8d2]/20 hover:bg-[#41c8d2]/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-colors",
                purchaseType === "onetime"
                  ? "border-[#41c8d2] bg-[#41c8d2]"
                  : "border-muted-foreground"
              )}
            >
              {purchaseType === "onetime" && (
                <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
              )}
            </div>
            <div>
              <Label className="text-base">One-time purchase</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {formatPrice(price)}
              </p>
            </div>
          </div>
        </button>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90 mt-3 h-11"
          disabled={!isAvailable}
        >
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      {/* Subscribe & Save Option */}
      <div>
        <button
          type="button"
          onClick={() => handlePurchaseTypeChange("subscription")}
          className={cn(
            "w-full text-left transition-colors duration-200",
            "rounded-lg border p-4",
            purchaseType === "subscription"
              ? "border-[#f6424a] bg-[#f6424a]/5"
              : "hover:border-[#f6424a]/20 hover:bg-[#f6424a]/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-colors",
                purchaseType === "subscription"
                  ? "border-[#f6424a] bg-[#f6424a]"
                  : "border-muted-foreground"
              )}
            >
              {purchaseType === "subscription" && (
                <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
              )}
            </div>
            <div>
              <Label className="text-base">Subscribe & Save</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Save up to 10% and never run out
              </p>
            </div>
          </div>
        </button>

        {/* Subscription Intervals */}
        <div
          className={cn(
            "pl-6 space-y-4 mt-3 transition-all duration-200",
            purchaseType === "subscription"
              ? "opacity-100"
              : "opacity-50 pointer-events-none"
          )}
        >
          <RadioGroup
            value={subscriptionInterval}
            onValueChange={(value) =>
              handleIntervalChange(value as SubscriptionInterval)
            }
          >
            {/* Monthly Option */}
            <button
              type="button"
              onClick={() => handleIntervalChange("monthly")}
              className={cn(
                "w-full text-left transition-colors duration-200",
                "rounded-lg border p-4",
                subscriptionInterval === "monthly"
                  ? "border-[#f6424a] bg-[#f6424a]/5"
                  : "hover:border-[#f6424a]/20 hover:bg-[#f6424a]/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-colors",
                    subscriptionInterval === "monthly"
                      ? "border-[#f6424a] bg-[#f6424a]"
                      : "border-muted-foreground"
                  )}
                >
                  {subscriptionInterval === "monthly" && (
                    <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label>Monthly</Label>
                    <div className="flex items-center gap-1 text-[#f6424a] text-sm">
                      <Percent className="h-3 w-3" />
                      <span>Save 10%</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-medium text-[#f6424a]">
                      {formatPrice(price * 0.9)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(price)}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Show additional options when subscription is selected */}
            {purchaseType === "subscription" && showAllOptions && (
              <>
                {/* Bi-monthly Option */}
                <button
                  type="button"
                  onClick={() => handleIntervalChange("bimonthly")}
                  className={cn(
                    "w-full text-left transition-colors duration-200",
                    "rounded-lg border p-4 mt-2",
                    subscriptionInterval === "bimonthly"
                      ? "border-[#f6424a] bg-[#f6424a]/5"
                      : "hover:border-[#f6424a]/20 hover:bg-[#f6424a]/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 transition-colors",
                        subscriptionInterval === "bimonthly"
                          ? "border-[#f6424a] bg-[#f6424a]"
                          : "border-muted-foreground"
                      )}
                    >
                      {subscriptionInterval === "bimonthly" && (
                        <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label>Every 2 Months</Label>
                        <div className="flex items-center gap-1 text-[#f6424a] text-sm">
                          <Percent className="h-3 w-3" />
                          <span>Save 7.5%</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-medium text-[#f6424a]">
                          {formatPrice(price * 0.925)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Quarterly Option */}
                <button
                  type="button"
                  onClick={() => handleIntervalChange("quarterly")}
                  className={cn(
                    "w-full text-left transition-colors duration-200",
                    "rounded-lg border p-4 mt-2",
                    subscriptionInterval === "quarterly"
                      ? "border-[#f6424a] bg-[#f6424a]/5"
                      : "hover:border-[#f6424a]/20 hover:bg-[#f6424a]/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 transition-colors",
                        subscriptionInterval === "quarterly"
                          ? "border-[#f6424a] bg-[#f6424a]"
                          : "border-muted-foreground"
                      )}
                    >
                      {subscriptionInterval === "quarterly" && (
                        <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label>Every 3 Months</Label>
                        <div className="flex items-center gap-1 text-[#f6424a] text-sm">
                          <Percent className="h-3 w-3" />
                          <span>Save 5%</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-medium text-[#f6424a]">
                          {formatPrice(price * 0.95)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </>
            )}
          </RadioGroup>

          {/* Subscribe Now Button */}
          <Button
            onClick={handleSubscribeNow}
            className="w-full gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90 h-11"
            disabled={!isAvailable}
          >
            <Plus className="h-4 w-4" />
            Subscribe Now
          </Button>
        </div>
      </div>
    </div>
  );
}
