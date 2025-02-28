/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { CartQuantity } from "@/components/cart/cart-quantity";
import { useCart } from "@/hooks/use-cart";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { CalendarRange, Percent, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    availableForSale: boolean;
    featuredImage: {
      url: string;
      altText: string;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          availableForSale: boolean;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice?: {
            amount: string;
            currencyCode: string;
          };
        };
      }>;
    };
  };
  searchParams?: {
    collection?: string;
  };
}

export function ProductCard({ product, searchParams = {} }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { items, addItem, removeItem } = useCart();
  const {
    isSubscriptionMode,
    selectedInterval,
    getDiscount,
    toggle,
    setInterval,
  } = useSubscriptionToggle();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const variant = product.variants?.edges[0]?.node;
  const variantId = variant?.id || product.id; // Get the variant ID or fallback to product ID
  const regularPrice = parseFloat(
    variant?.price?.amount || product.priceRange.minVariantPrice.amount
  );
  const compareAtPrice = variant?.compareAtPrice?.amount;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > regularPrice;

  const discount = getDiscount();
  const discountedPrice = regularPrice * (1 - discount);
  const cartItem = items.find((item) => item.id === product.id);
  const isAvailable = variant?.availableForSale ?? product.availableForSale;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    const item = {
      id: product.id,
      variantId: variantId, // Add the required variantId property
      title: product.title,
      price: isSubscriptionMode ? discountedPrice : regularPrice,
      originalPrice: isSubscriptionMode ? regularPrice : undefined,
      image: product.featuredImage?.url || "",
      quantity: 1,
      subscription: isSubscriptionMode ? selectedInterval : undefined,
    };

    addItem(item);

    // Only show subscription upsell if:
    // 1. Not already in subscription mode
    // 2. Item is not already in cart
    if (!isSubscriptionMode && !cartItem) {
      toast(
        <div className="relative">
          <div className="flex flex-col gap-3">
            <p
              className={cn(
                "font-medium pr-6 line-clamp-1",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {product.title} added to cart
            </p>
            <div className="flex items-center justify-between gap-2 p-2 bg-[#41c8d2]/10 rounded-lg">
              <div className="flex items-center gap-1.5">
                <CalendarRange
                  className={cn(
                    "text-[#41c8d2]",
                    isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
                  )}
                />
                <p
                  className={cn(
                    "font-medium",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Subscribe monthly and save 10%
                </p>
              </div>
              <button
                className={cn(
                  "bg-[#41c8d2] hover:bg-[#41c8d2]/90 text-white rounded-md",
                  "transition-colors duration-200",
                  isMobile ? "h-7 text-xs px-2" : "h-9 px-4"
                )}
                onClick={() => {
                  // Remove regular item
                  removeItem(product.id);
                  // Add subscription item
                  setInterval("monthly");
                  toggle();
                  addItem({
                    ...item,
                    price: regularPrice * 0.9,
                    originalPrice: regularPrice,
                    subscription: "monthly",
                  });
                  toast.success(
                    "Switched to monthly subscription with 10% off",
                    {
                      duration: 2000,
                    }
                  );
                }}
              >
                Subscribe Now
              </button>
            </div>
          </div>
          <button
            className={cn(
              "absolute top-0 right-0 h-6 w-6 hover:bg-transparent",
              "text-muted-foreground hover:text-foreground transition-colors",
              isMobile ? "-top-1 -right-1" : "top-0 right-0"
            )}
            onClick={() => toast.dismiss()}
          >
            <ChevronDown className="h-4 w-4" />.
          </button>
        </div>,
        {
          duration: 2000,
        }
      );
    } else {
      // Only show success toast for subsequent additions or subscription mode
      toast.success(`${product.title} added to cart`, {
        duration: 2000,
      });
    }
  };

  return (
    <Link
      href={`/products/${product.handle}${
        searchParams.collection ? `?collection=${searchParams.collection}` : ""
      }`}
      className={cn(
        "group h-full overflow-hidden transition-all duration-300",
        !isAvailable && "opacity-75",
        isHovered && "border-primary"
      )}
    >
      <Card
        className="h-full overflow-hidden flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="aspect-square relative">
          <img
            src={product.featuredImage?.url}
            alt={product.featuredImage?.altText || product.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
          <div
            className={cn(
              "absolute top-2 flex flex-col gap-1.5",
              isSubscriptionMode ? "left-2" : "right-2"
            )}
          >
            {!isAvailable && (
              <Badge variant="destructive" className="shadow-sm">
                Out of Stock
              </Badge>
            )}
            {(isOnSale || isSubscriptionMode) && isAvailable && (
              <Badge className="bg-[#f6424a] text-white border-none shadow-sm">
                <Percent className="h-3 w-3 mr-1" />
                Save{" "}
                {isSubscriptionMode
                  ? discount * 100
                  : Math.round(
                      ((parseFloat(compareAtPrice!) - regularPrice) /
                        parseFloat(compareAtPrice!)) *
                        100
                    )}
                %
              </Badge>
            )}
            {cartItem?.subscription && (
              <Badge className="flex items-center gap-1.5 bg-white text-[#f6424a] border border-[#f6424a]/20 shadow-sm">
                <CalendarRange className="h-3.5 w-3.5" />
                {cartItem.subscription === "monthly"
                  ? "Monthly"
                  : cartItem.subscription === "bimonthly"
                  ? "Every 2 Months"
                  : "Every 3 Months"}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-2">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#f6424a] transition-colors">
            {product.title}
          </h3>

          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "font-semibold text-[#f6424a]",
                  isSubscriptionMode ? "text-xs" : "text-sm"
                )}
              >
                {formatPrice(
                  isSubscriptionMode ? discountedPrice : regularPrice
                )}
              </span>
              {(isOnSale || isSubscriptionMode) && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2">
            {cartItem ? (
              <CartQuantity
                productId={product.id}
                className="w-full"
                showToast={true}
              />
            ) : (
              <button
                className="w-full h-8 gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90 text-white rounded-md text-xs px-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!isAvailable}
              >
                <Plus className="h-3.5 w-3.5" />
                {isSubscriptionMode ? "Subscribe Now" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
