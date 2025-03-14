"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import useEmblaCarousel from "embla-carousel-react";
import {
  getProductRecommendations,
  getProductsByType,
  getRandomProducts,
} from "@/lib/shopify/recommendations"; // Adjust import path as needed

// Use the exact same Product interface as in your ProductCard component
// to ensure type compatibility
interface Product {
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
}

interface ProductRecommendationsProps {
  productId: string;
  type?: "recommended" | "popular" | "new" | "featured" | "bestseller";
  count?: number;
}

export function ProductRecommendations({
  productId,
  type = "recommended",
  count = 4,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    slidesToScroll: isMobile ? 1 : 2,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let fetchedProducts: Product[] = [];

        // Fetch different products based on the type
        if (type === "recommended") {
          fetchedProducts = await getProductRecommendations(productId);

          // If we don't get enough recommendations, supplement with random products
          if (fetchedProducts.length < count) {
            const randomProducts = await getRandomProducts(
              count - fetchedProducts.length
            );
            fetchedProducts = [...fetchedProducts, ...randomProducts];
          }
        } else {
          // For 'popular', 'new', or other types
          fetchedProducts = await getProductsByType(type, count + 1); // Get one extra to account for filtering
        }

        // Filter out the current product if it's in the results
        // Fix for the TypeScript error by explicitly typing the parameter
        const filteredProducts = fetchedProducts.filter(
          (p: Product) => p.id !== productId
        );

        // Limit to requested count
        setProducts(filteredProducts.slice(0, count));
      } catch (error) {
        console.error(`Error loading ${type} products:`, error);

        // Attempt to fetch random products as fallback
        try {
          const fallbackProducts = await getRandomProducts(count);
          setProducts(
            fallbackProducts.filter((p: Product) => p.id !== productId)
          );
        } catch (fallbackError) {
          console.error("Failed to fetch fallback products:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProducts();
    }
  }, [productId, type, count]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(count)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="aspect-[4/3] animate-pulse bg-muted rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return null; // Hide the section if there are no products
  }

  return (
    <div className="relative">
      {/* Navigation Buttons - Desktop Only */}
      {!isMobile && products.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "min-w-0",
                isMobile
                  ? "flex-[0_0_100%]" // Full width on mobile
                  : "flex-[0_0_25%]" // 4 items per row on desktop
              )}
            >
              {/* Remove the listType prop to fix the type error */}
              <ProductCard product={product} searchParams={{}} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Pagination Dots */}
      {isMobile && products.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(products.length)].map((_, index) => (
            <button
              key={`dot-${index}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-6 bg-[#41c8d2]"
                  : "w-1.5 bg-[#41c8d2]/20 hover:bg-[#41c8d2]/40"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
