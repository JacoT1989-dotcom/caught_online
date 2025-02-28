/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, CalendarRange } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SubscriptionSelect, getDiscountRate } from "./subscription-select";

interface CartItemProps {
  item: {
    id: string;
    variantId: string; // Add the missing variantId property to match CartItem interface
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    subscription?: string | null;
  };
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleSubscriptionChange = (value: string) => {
    const subscription = value === "none" ? null : value;
    const basePrice = item.originalPrice || item.price;
    const discount = getDiscountRate(subscription);
    const newPrice = basePrice * (1 - discount);

    removeItem(item.id);
    const { addItem } = useCart.getState();
    addItem({
      ...item,
      price: newPrice,
      originalPrice: basePrice,
      subscription,
    });
  };

  // Calculate discount percentage if there's an original price
  const discountPercentage = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  return (
    <div className="flex gap-3 bg-card rounded-lg p-3 border">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover rounded-md"
        />
        {discountPercentage > 0 && (
          <Badge className="absolute -top-2 -left-2 bg-[#f6424a] text-white border-none text-[10px] px-1.5 py-0.5">
            Save {discountPercentage}%
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
            {item.subscription && (
              <Badge
                variant="secondary"
                className="mt-1 gap-1 bg-[#f6424a]/10 text-[#f6424a] border-[#f6424a]/20 text-xs"
              >
                <CalendarRange className="h-3 w-3" />
                {item.subscription === "monthly"
                  ? "Monthly"
                  : item.subscription === "bimonthly"
                  ? "Every 2 Months"
                  : "Every 3 Months"}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive -mr-1"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-1">
          <SubscriptionSelect
            value={item.subscription || "none"}
            onValueChange={handleSubscriptionChange}
            variant="compact"
          />
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() =>
                handleQuantityChange(Math.max(0, item.quantity - 1))
              }
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-medium text-sm">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.originalPrice && item.originalPrice !== item.price && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(item.originalPrice * item.quantity)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
