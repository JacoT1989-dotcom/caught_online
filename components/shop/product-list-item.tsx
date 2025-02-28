"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CartQuantity } from "@/components/cart/cart-quantity";
import { useCart } from "@/hooks/use-cart";
import { useMultiCart } from "@/hooks/use-multi-cart";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import { cn } from "@/lib/utils";
import { CalendarRange, Percent, ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductListItemProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string;
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
  isSelected: boolean;
}

export function ProductListItem({ product, isSelected }: ProductListItemProps) {
  const { items, addItem } = useCart();
  const { toggleProduct } = useMultiCart();
  const { isSubscriptionMode, selectedInterval, getDiscount } =
    useSubscriptionToggle();
  const [isHovered, setIsHovered] = useState(false);

  const variant = product.variants?.edges[0]?.node;
  const regularPrice = parseFloat(
    variant?.price?.amount || product.priceRange.minVariantPrice.amount
  );
  const compareAtPrice = variant?.compareAtPrice?.amount;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > regularPrice;

  const discountedPrice = regularPrice * (1 - getDiscount());
  const cartItem = items.find((item) => item.id === product.id);
  const isAvailable = variant?.availableForSale ?? product.availableForSale;

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable) {
      toggleProduct(product.id, {
        id: product.id,
        title: product.title,
        price: isSubscriptionMode ? discountedPrice : regularPrice,
        image: product.featuredImage?.url || "",
        variantId: variant?.id,
        availableForSale: isAvailable,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      title: product.title,
      price: isSubscriptionMode ? discountedPrice : regularPrice,
      image: product.featuredImage?.url || "",
      quantity: 1,
      subscription: isSubscriptionMode ? selectedInterval : undefined,
      variantId: variant?.id, // Added missing variantId property
    });

    toast.success(`${product.title} added to cart`);
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-300",
        isSelected && "border-[#f6424a] bg-[#f6424a]/5",
        !isAvailable && "opacity-75",
        isHovered && !isSelected && "border-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onClick={handleSelect}
          disabled={!isAvailable}
          className={cn(
            "h-5 w-5 transition-colors",
            isSelected && "bg-[#f6424a] border-[#f6424a]",
            !isAvailable && "opacity-50"
          )}
        />
      </div>

      <Link href={`/products/${product.handle}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.featuredImage?.url}
            alt={product.featuredImage?.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
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
                  ? getDiscount() * 100
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

        {/* Content */}
        <div className="flex-1 p-4">
          <h3 className="font-medium text-base mb-2 line-clamp-2 group-hover:text-[#f6424a] transition-colors">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {product.description}
            </p>
          )}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-[#f6424a]">
                {formatPrice(
                  isSubscriptionMode ? discountedPrice : regularPrice
                )}
              </span>
              {(isOnSale || isSubscriptionMode) && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cart Actions */}
        <div className="p-4 pt-0">
          {cartItem ? (
            <CartQuantity productId={product.id} />
          ) : (
            <Button
              className="w-full gap-2 bg-[#f6424a] hover:bg-[#f6424a]/90"
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              {isSubscriptionMode ? (
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
          )}
        </div>
      </Link>
    </Card>
  );
}
