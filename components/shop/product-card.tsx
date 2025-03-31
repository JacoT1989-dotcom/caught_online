"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { CartQuantity } from "@/components/cart/cart-quantity";
import { useCart } from "@/hooks/use-cart";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { CalendarRange, Percent, Plus, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trackAddToCart } from "@/lib/analytics";

import { Button } from "../ui/button";
import { AuthProvider } from "../auth/auth-provider";
import { useAuth } from "@/hooks/use-auth";

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
  forceSubscription?: boolean;
}

export function ProductCard({
  product,
  searchParams = {},
  forceSubscription = false,
}: ProductCardProps) {
  const user = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { items, addItem } = useCart();
  const { isSubscriptionMode, selectedInterval, getDiscount } =
    useSubscriptionToggle();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Set isClient to true when component mounts - ensures we're on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const variant = product.variants?.edges[0]?.node;
  const regularPrice = parseFloat(
    variant?.price?.amount || product.priceRange.minVariantPrice.amount
  );
  const compareAtPrice = variant?.compareAtPrice?.amount;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > regularPrice;

  // Only access cart items on the client
  const cartItem = isClient
    ? items.find((item) => item.id === product.id)
    : null;
  const isSubscribed = Boolean(cartItem?.subscription);

  // Calculate price based on subscription status - only on the client
  const shouldShowSubscriptionPrice =
    isClient && (forceSubscription || isSubscriptionMode || isSubscribed);
  const discount = shouldShowSubscriptionPrice ? getDiscount() : 0;
  const finalPrice = regularPrice * (1 - discount);

  const isAvailable = variant?.availableForSale ?? product.availableForSale;

  const getDiscountPercentage = () => {
    if (shouldShowSubscriptionPrice) {
      return Math.floor(discount * 100);
    } else if (isOnSale && compareAtPrice) {
      return Math.floor(
        ((parseFloat(compareAtPrice) - regularPrice) /
          parseFloat(compareAtPrice)) *
          100
      );
    }
    return null;
  };

  const discountPercentage = isClient ? getDiscountPercentage() : null;
  // For ProductCard.tsx
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    // Try multiple authentication checks
    let isLoggedIn = false;

    try {
      // Check 1: Look for the logged_in cookie
      const getCookie = (name: string): string | null => {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
          }
        }
        return null;
      };

      const loggedInCookie = getCookie("logged_in");
      isLoggedIn = loggedInCookie === "true";
      console.log("Check 1 - Logged in cookie:", isLoggedIn);

      // Check 2: Look for user auth in localStorage (fallback)
      if (!isLoggedIn) {
        const hasUserCart = Object.keys(localStorage).some(
          (key) => key.includes("user-cart") || key.includes("Customer")
        );
        isLoggedIn = hasUserCart;
        console.log("Check 2 - User cart in storage:", isLoggedIn);
      }

      // Check 3: Use the useAuth hook (fallback)
      if (!isLoggedIn) {
        isLoggedIn = !!user.accessToken;
        console.log("Check 3 - useAuth accessToken:", isLoggedIn);
      }

      console.log("Final authentication result:", isLoggedIn);
    } catch (error) {
      console.error("Error checking authentication:", error);
      // Default to allowing the action in case of an error
      isLoggedIn = true;
    }

    // If user is not authenticated, show login message and redirect
    if (!isLoggedIn) {
      toast.error("Please log in to add items to cart");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

      return;
    }

    // User is authenticated, proceed with adding to cart
    const item = {
      id: product.id,
      variantId: variant?.id || product.id,
      title: product.title,
      price: finalPrice,
      originalPrice: shouldShowSubscriptionPrice ? regularPrice : undefined,
      image: product.featuredImage?.url || "",
      quantity: 1,
      subscription: shouldShowSubscriptionPrice ? selectedInterval : undefined,
    };

    addItem(item);

    // Track add to cart event
    trackAddToCart({
      id: product.id,
      title: product.title,
      price: finalPrice,
      variantId: variant?.id || product.id,
      quantity: 1,
    });

    toast.success(`${product.title} added to cart`, {
      duration: 2000,
    });
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
          <Image
            src={product.featuredImage?.url}
            alt={product.featuredImage?.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
          <div
            className={cn(
              "absolute top-2 flex flex-col gap-1.5",
              shouldShowSubscriptionPrice ? "left-2" : "right-2"
            )}
          >
            {!isAvailable && (
              <Badge variant="destructive" className="shadow-sm">
                Out of Stock
              </Badge>
            )}

            {/* Only render client-specific badges when isClient is true */}
            {isClient && discountPercentage !== null && isAvailable && (
              <Badge className="bg-[#f6424a] text-white border-none shadow-sm">
                <Percent className="h-3 w-3 mr-1" />
                Save {discountPercentage}%
              </Badge>
            )}

            {isClient && cartItem?.subscription && (
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
                  shouldShowSubscriptionPrice ? "text-xs" : "text-sm"
                )}
              >
                {formatPrice(finalPrice)}
              </span>
              {shouldShowSubscriptionPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2">
            {isClient && cartItem ? (
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
                {shouldShowSubscriptionPrice ? "Subscribe Now" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
