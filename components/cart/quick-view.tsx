/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import {
  CalendarRange,
  ShoppingCart,
  Plus,
  Percent,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { trackViewContent } from "@/lib/analytics";

const subscriptionOptions = [
  { value: "monthly", label: "Monthly", discount: 0.1 },
  { value: "bimonthly", label: "Every 2 Months", discount: 0.075 },
  { value: "quarterly", label: "Every 3 Months", discount: 0.05 },
];

interface QuickViewProps {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    variantId?: string;
    availableForSale?: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const { addItem, items } = useCart();
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscription">(
    "onetime"
  );
  const [subscriptionInterval, setSubscriptionInterval] = useState("monthly");
  const cartItem = items.find((item) => item.id === product.id);

  const selectedOption = subscriptionOptions.find(
    (opt) => opt.value === subscriptionInterval
  );
  const discountedPrice = product.price * (1 - (selectedOption?.discount || 0));

  const handleAddToCart = () => {
    const isSubscription = purchaseType === "subscription";
    addItem({
      id: product.id,
      title: product.title,
      price: isSubscription ? discountedPrice : product.price,
      originalPrice: isSubscription ? product.price : undefined,
      image: product.image,
      quantity: 1,
      subscription: isSubscription ? subscriptionInterval : undefined,
      variantId: product.variantId || product.id, // Add the variantId property
    });

    toast.success(`${product.title} added to cart`);
    onOpenChange(false);
  };

  useEffect(() => {
    if (product) {
      // Track view content (unified)
      trackViewContent({
        id: product.id,
        title: product.title,
        price: product.price,
        variantId: product.variantId,
      });
    }
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>Quick Add to Cart - {product.title}</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-lg font-semibold text-[#f6424a]">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <RadioGroup
              value={purchaseType}
              onValueChange={(value: "onetime" | "subscription") =>
                setPurchaseType(value)
              }
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="onetime" id="onetime" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="onetime">One-time purchase</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscription" id="subscription" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="subscription">Subscribe & Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Save up to 10% and never run out
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {purchaseType === "subscription" && (
              <div className="pl-6 space-y-4">
                <RadioGroup
                  value={subscriptionInterval}
                  onValueChange={setSubscriptionInterval}
                >
                  {subscriptionOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={option.value}>{option.label}</Label>
                          <Badge className="bg-[#f6424a]/10 text-[#f6424a] border-[#f6424a]/20">
                            <Percent className="h-3 w-3 mr-1" />
                            Save {option.discount * 100}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm font-medium text-[#f6424a]">
                            {formatPrice(product.price * (1 - option.discount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90"
            disabled={!product.availableForSale}
          >
            <ShoppingCart className="h-4 w-4" />
            {purchaseType === "subscription" ? "Subscribe Now" : "Add to Cart"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
