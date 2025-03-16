/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useRegion } from "@/hooks/use-region";
import { useInventory } from "@/hooks/use-inventory";
import { RegionPrompt } from "@/components/cart/region-prompt";
import { SubscriptionOptions } from "@/components/product/subscription-options";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductRecommendations } from "@/components/product/product-recommendations";
import { ProductRecipes } from "@/components/product/product-recipes";
import { CartQuantity } from "@/components/cart/cart-quantity";
import { CalendarRange, Fish, Leaf, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/types/subscription";
import type { SubscriptionInterval } from "@/lib/types/subscription";
import { DeliverySection } from "@/components/product/delivery/delivery-section";
import { trackAddToCart } from "@/lib/analytics";

const infoSections = [
  {
    title: "Premium Quality",
    description:
      "We source only the finest seafood from sustainable fisheries and trusted suppliers.",
    icon: Fish,
  },
  {
    title: "Sustainable Sourcing",
    description:
      "Our commitment to ocean-friendly fishing practices ensures a better future for marine life.",
    icon: Leaf,
  },
  {
    title: "Quality Guaranteed",
    description: "We stand behind the quality of every product we deliver.",
    icon: ShieldCheck,
  },
];

interface ProductDetailsProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    variants?: {
      edges: Array<{
        node: {
          id: string;
          price: {
            amount: string;
            currencyCode: string;
          };
        };
      }>;
    };
    featuredImage: {
      url: string;
      altText?: string;
    };
    images?: {
      edges: Array<{
        node: {
          url: string;
          altText?: string;
        };
      }>;
    };
    availableForSale: boolean;
    productType?: string;
    tags?: string[];
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  // All hooks must be called at the top level before any conditional logic
  const [showRegionPrompt, setShowRegionPrompt] = useState(false);
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscription">(
    "onetime"
  );
  const [subscriptionInterval, setSubscriptionInterval] =
    useState<SubscriptionInterval>("monthly");
  const { items, addItem } = useCart();
  const { selectedRegion } = useRegion();
  const { loading, isAvailable, quantity, checkProductInventory } =
    useInventory();

  // Call useEffect unconditionally
  useEffect(() => {
    if (selectedRegion && product.handle) {
      checkProductInventory(product.handle);
    }
  }, [selectedRegion, product.handle, checkProductInventory]);

  // Extract data and computed values
  const mainVariant = product.variants?.edges[0]?.node;
  const price = mainVariant?.price || product.priceRange?.minVariantPrice;
  const variantId = mainVariant?.id || product.id;

  // Handle missing price - this is now done after all hooks are called
  if (!price) {
    console.error("No price found for product:", product.title);
    return (
      <div className="text-red-500">
        Product pricing information unavailable
      </div>
    );
  }

  const regularPrice = parseFloat(price.amount);
  const cartItem = items.find((item) => item.id === product.id);
  const hasSubscriptionInCart = items.some((item) => item.subscription);
  const isSubscribed = cartItem?.subscription;

  // Calculate price based on subscription status and interval
  const shouldShowSubscriptionPrice =
    purchaseType === "subscription" || hasSubscriptionInCart;
  const selectedPlan = SUBSCRIPTION_PLANS[subscriptionInterval];
  const discount = shouldShowSubscriptionPrice
    ? selectedPlan?.discount || 0
    : 0;
  const finalPrice = regularPrice * (1 - discount);
  const hasAdditionalImages = !!product.images?.edges?.length;

  const handleAddToCart = () => {
    if (!selectedRegion) {
      setShowRegionPrompt(true);
      return;
    }

    try {
      addItem({
        id: product.id,
        variantId: variantId,
        title: product.title,
        price: finalPrice,
        originalPrice: shouldShowSubscriptionPrice ? regularPrice : undefined,
        image: product.featuredImage.url,
        quantity: 1,
        subscription: shouldShowSubscriptionPrice
          ? subscriptionInterval
          : undefined,
      });

      trackAddToCart({
        id: product.id,
        title: product.title,
        price: finalPrice,
        variantId: product.id,
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="space-y-16">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className="w-full h-full object-cover rounded-lg"
            />
            {isSubscribed && (
              <Badge className="absolute top-2 right-2 flex items-center gap-1.5 bg-white text-[#f6424a] border border-[#f6424a]/20 shadow-sm">
                <CalendarRange className="h-3.5 w-3.5" />
                {isSubscribed === "monthly"
                  ? "Monthly"
                  : isSubscribed === "bimonthly"
                    ? "Every 2 Months"
                    : "Every 3 Months"}
              </Badge>
            )}
          </div>
          {hasAdditionalImages && (
            <div className="grid grid-cols-4 gap-2">
              {product.images?.edges.map((image, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={image.node.url}
                    alt={image.node.altText || `${product.title} ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-semibold text-[#f6424a]">
                {formatPrice(finalPrice)}
              </span>
              {shouldShowSubscriptionPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="secondary">Checking availability...</Badge>
            ) : !selectedRegion ? (
              <Badge variant="secondary">
                Select region to check availability
              </Badge>
            ) : !isAvailable ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100"
              >
                {quantity > 10 ? "In Stock" : `${quantity} units left`}
              </Badge>
            )}
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {cartItem ? (
            <div className="space-y-4">
              <CartQuantity
                productId={product.id}
                className="w-full max-w-[200px]"
                showToast={true}
              />
            </div>
          ) : (
            <SubscriptionOptions
              price={regularPrice}
              purchaseType={purchaseType}
              onPurchaseTypeChange={setPurchaseType}
              subscriptionInterval={subscriptionInterval}
              onSubscriptionIntervalChange={setSubscriptionInterval}
              onAddToCart={handleAddToCart}
              isAvailable={isAvailable}
            />
          )}
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {infoSections.map((section) => (
          <div
            key={section.title}
            className="p-6 rounded-lg border bg-card hover:border-[#f6424a]/20 transition-colors"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-full bg-[#f6424a]/10">
                <section.icon className="h-6 w-6 text-[#f6424a]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <ProductRecommendations productId={product.id} count={10} />
      </section>

      {/* Delivery Information */}
      <DeliverySection />

      {/* More Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Popular Products</h2>
        <ProductRecommendations
          productId={product.id}
          type="popular"
          count={10}
        />
      </section>

      {/* Recipes */}
      {product.tags && product.productType && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Recipes</h2>
          <ProductRecipes
            tags={product.tags}
            productType={product.productType}
          />
        </section>
      )}

      {/* New Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
        <ProductRecommendations productId={product.id} type="new" count={10} />
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <ProductReviews productId={product.id} />
      </section>

      <RegionPrompt
        open={showRegionPrompt}
        onOpenChange={setShowRegionPrompt}
      />
    </div>
  );
}
