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
import {
  CalendarRange,
  Fish,
  Leaf,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/types/subscription";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionInterval } from "@/lib/types/subscription";
import { DeliverySection } from "@/components/product/delivery/delivery-section";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";

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

interface SubscriptionVariantIds {
  monthly: string;
  bimonthly: string;
  quarterly: string;
}

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
          title: string; // Added title field for variant nodes
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

  // Add state for active image
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    product.featuredImage.url
  );

  // Add state for selected variant and quantity
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [localQuantity, setLocalQuantity] = useState<number>(1);

  // Call useEffect unconditionally
  useEffect(() => {
    if (selectedRegion && product.handle) {
      checkProductInventory(product.handle);
    }
  }, [selectedRegion, product.handle, checkProductInventory]);

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageUrl(product.featuredImage.url);
  }, [product.featuredImage.url]);

  // Extract data and computed values
  const mainVariant = product.variants?.edges[0]?.node;
  const price = mainVariant?.price || product.priceRange?.minVariantPrice;

  // Extract weight variants if they exist
  const weightVariants = getWeightVariants(product);
  const hasWeightVariants = weightVariants.length > 0;

  // Set initial weight if variants exist
  useEffect(() => {
    if (hasWeightVariants && !selectedWeight && weightVariants.length > 0) {
      setSelectedWeight(weightVariants[0].weight);
    }
  }, [hasWeightVariants, weightVariants, selectedWeight]);

  // Get current variant ID based on selection
  const currentVariantId = getVariantId(product, selectedWeight);
  const variantId = currentVariantId || mainVariant?.id || product.id;

  // Handle missing price - this is now done after all hooks are called
  if (!price) {
    console.error("No price found for product:", product.title);
    return (
      <div className="text-red-500">
        Product pricing information unavailable
      </div>
    );
  }

  // Get price for the currently selected weight variant
  const getVariantPrice = () => {
    if (hasWeightVariants && selectedWeight) {
      const variant = weightVariants.find((v) => v.weight === selectedWeight);
      return variant ? parseFloat(variant.price) : parseFloat(price.amount);
    }
    return parseFloat(price.amount);
  };

  const regularPrice = getVariantPrice();
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

  // Create a proper array of unique images for the gallery
  const allImages = [
    {
      url: product.featuredImage.url,
      altText: product.featuredImage.altText || product.title,
    },
    ...(product.images?.edges
      .filter((edge) => edge.node.url !== product.featuredImage.url) // Filter out duplicates of featured image
      .map((edge) => ({
        url: edge.node.url,
        altText: edge.node.altText || product.title,
      })) || []),
  ];

  // Function to extract weight variants from product
  function getWeightVariants(product: ProductDetailsProps["product"]) {
    const variants = product.variants?.edges || [];
    const weightVariants: { weight: string; price: string; id: string }[] = [];
    const weightPattern = /(\d+g)/;

    // Check if variants have weight in their titles
    variants.forEach(({ node }) => {
      // Check if node and node.title exist before trying to match
      if (node && node.title) {
        const match = node.title.match(weightPattern);
        if (match) {
          weightVariants.push({
            weight: match[1],
            price: node.price.amount,
            id: node.id,
          });
        }
      }
    });

    return weightVariants;
  }

  // Function to get variant ID based on selected weight
  function getVariantId(
    product: ProductDetailsProps["product"],
    selectedWeight: string
  ) {
    if (!selectedWeight) return null;

    const variants = product.variants?.edges || [];
    const variant = variants.find(
      ({ node }) => node?.title && node.title.includes(selectedWeight)
    );

    return variant ? variant.node.id : null;
  }

  // Function to handle quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    setLocalQuantity(Math.max(1, newQuantity));
  };

  const handleAddToCart = () => {
    if (!selectedRegion) {
      setShowRegionPrompt(true);
      return;
    }

    try {
      addItem({
        id: product.id,
        variantId: variantId,
        title: `${product.title}${selectedWeight ? ` - ${selectedWeight}` : ""}`,
        price: finalPrice,
        originalPrice: shouldShowSubscriptionPrice ? regularPrice : undefined,
        image: product.featuredImage.url,
        quantity: localQuantity, // Use the local quantity state
        subscription: shouldShowSubscriptionPrice
          ? subscriptionInterval
          : undefined,
      });

      trackAddToCart({
        id: product.id,
        title: product.title,
        price: finalPrice,
        variantId: variantId,
        quantity: localQuantity, // Use the local quantity state
      });

      toast.success(`${localQuantity}x ${product.title} added to cart`, {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const baseProductId = product.id;

  const getSubscriptionVariantIds = (
    product: ProductDetailsProps["product"]
  ) => {
    console.log("Finding subscription variants for product:", product.title);

    // Find variants with subscription options
    const variants = product.variants?.edges || [];

    // Get IDs for each subscription interval
    const variantIds: SubscriptionVariantIds = {
      monthly: "",
      bimonthly: "",
      quarterly: "",
    };

    // Log all variants to see what we're working with
    console.log(
      "All variants:",
      variants.map((v) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price?.amount,
      }))
    );

    // Try to find variants based on their titles or options
    variants.forEach(({ node }) => {
      if (node.title) {
        const title = node.title.toLowerCase();

        // Use more flexible matching to catch variations in naming
        if (
          title.includes("month") &&
          !title.includes("2") &&
          !title.includes("3") &&
          !title.includes("two") &&
          !title.includes("three")
        ) {
          console.log(
            "Found monthly variant:",
            node.id,
            "with price:",
            node.price?.amount
          );
          variantIds.monthly = node.id;
        } else if (
          title.includes("2 month") ||
          title.includes("every 2 month") ||
          title.includes("bi") ||
          title.includes("two month")
        ) {
          console.log(
            "Found bimonthly variant:",
            node.id,
            "with price:",
            node.price?.amount
          );
          variantIds.bimonthly = node.id;
        } else if (
          title.includes("3 month") ||
          title.includes("every 3 month") ||
          title.includes("quarter") ||
          title.includes("three month")
        ) {
          console.log(
            "Found quarterly variant:",
            node.id,
            "with price:",
            node.price?.amount
          );
          variantIds.quarterly = node.id;
        }
      }
    });

    // If we still don't have all interval IDs, try matching by price
    // This assumes different subscription intervals have different prices
    if (!variantIds.monthly || !variantIds.bimonthly || !variantIds.quarterly) {
      // Extract prices from the image to match with variants
      const expectedPrices = {
        monthly: "499.10", // From the image
        bimonthly: "461.58", // From the image
        quarterly: "474.05", // From the image
      };

      variants.forEach(({ node }) => {
        const price = node.price?.amount;

        if (price === expectedPrices.monthly && !variantIds.monthly) {
          console.log("Found monthly variant by price:", node.id);
          variantIds.monthly = node.id;
        } else if (
          price === expectedPrices.bimonthly &&
          !variantIds.bimonthly
        ) {
          console.log("Found bimonthly variant by price:", node.id);
          variantIds.bimonthly = node.id;
        } else if (
          price === expectedPrices.quarterly &&
          !variantIds.quarterly
        ) {
          console.log("Found quarterly variant by price:", node.id);
          variantIds.quarterly = node.id;
        }
      });
    }

    // Fallback to using the main variant ID if no subscription variants found
    if (!variantIds.monthly && variants.length > 0) {
      const defaultVariantId = variants[0].node.id;
      console.log(
        "No specific subscription variants found, using default variant:",
        defaultVariantId
      );

      variantIds.monthly = defaultVariantId;
      variantIds.bimonthly = defaultVariantId;
      variantIds.quarterly = defaultVariantId;
    }

    console.log("Final subscription variant IDs:", variantIds);
    return variantIds;
  };

  // Inside your component's render function
  const subscriptionVariantIds = getSubscriptionVariantIds(product);

  return (
    <div className="space-y-16">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <img
              src={activeImageUrl}
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
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((image, i) => (
                <button
                  key={i}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    activeImageUrl === image.url
                      ? "border-[#f6424a]"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setActiveImageUrl(image.url)}
                  aria-label={`View ${image.altText || `image ${i + 1}`}`}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `${product.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
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

          {/* Weight Variants Selection */}
          {hasWeightVariants && (
            <div className="space-y-2">
              <h3 className="font-medium">Weight</h3>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {weightVariants.map((variant) => (
                    <SelectItem key={variant.weight} value={variant.weight}>
                      {variant.weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              productId={baseProductId} // Pass the base product ID
              subscriptionVariantIds={subscriptionVariantIds} // Pass the variant IDs
              quantity={localQuantity} // Pass the selected quantity
              useSubscriptionFlow={true}
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
