"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useRegion } from "@/hooks/use-region";
import { useInventory } from "@/hooks/use-inventory";
import { ShoppingCart, Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PurchaseOptions } from "./purchase-options";
import { QuickViewImage } from "./quick-view-image";
import { subscriptionOptions } from "./subscription-select";

interface QuickViewContentProps {
  product: {
    id: string;
    title: string;
    handle: string;
    price: number;
    originalPrice?: number;
    image: string;
    variantId?: string;
  };
  onClose: () => void;
  onLocationSelect?: () => void;
}

export function QuickViewContent({
  product,
  onClose,
  onLocationSelect,
}: QuickViewContentProps) {
  const { addItem } = useCart();
  const { selectedRegion } = useRegion();
  const { loading, isAvailable, checkProductInventory } = useInventory();
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscription">(
    "onetime"
  );
  const [subscriptionInterval, setSubscriptionInterval] = useState("monthly");

  useEffect(() => {
    checkProductInventory(product.handle);
  }, [product.handle, checkProductInventory]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedRegion) {
      onClose();
      onLocationSelect?.();
      return;
    }

    // Final inventory check before adding to cart
    await checkProductInventory(product.handle);
    if (!isAvailable) {
      toast.error("Sorry, this product is no longer available");
      onClose();
      return;
    }

    const isSubscription = purchaseType === "subscription";
    const selectedOption = subscriptionOptions.find(
      (opt) => opt.value === subscriptionInterval
    );
    const discountedPrice = isSubscription
      ? product.price * (1 - (selectedOption?.discount || 0))
      : product.price;

    addItem({
      id: product.id,
      title: product.title,
      price: discountedPrice,
      originalPrice: isSubscription ? product.price : undefined,
      image: product.image,
      quantity: 1,
      subscription: isSubscription ? subscriptionInterval : undefined,
      variantId: product.variantId || "", // Added the missing 'variantId' property
    });

    toast.success(`${product.title} added to cart`);
    onClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="space-y-4 p-8 text-center">
        <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
        <p>Sorry, this product is currently out of stock.</p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuickViewImage image={product.image} title={product.title} />

      <PurchaseOptions
        price={product.price}
        purchaseType={purchaseType}
        onPurchaseTypeChange={setPurchaseType}
        subscriptionInterval={subscriptionInterval}
        onSubscriptionIntervalChange={setSubscriptionInterval}
      />

      <Button
        onClick={handleAddToCart}
        className="w-full gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90"
      >
        {purchaseType === "subscription" ? (
          <>
            <Plus className="h-4 w-4" />
            Subscribe Now
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
