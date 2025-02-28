"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import useEmblaCarousel from "embla-carousel-react";

// Updated Product type to match both components
interface ProductVariant {
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
  title?: string;
  quantityAvailable?: number;
}

// Updated Product interface to match both components
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
      node: ProductVariant;
    }>;
  };
}

interface ProductRecommendationsProps {
  productId: string;
  type?: "recommended" | "popular" | "new";
}

export function ProductRecommendations({
  productId,
  type = "recommended",
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
      try {
        // Generate mock products with unique IDs using timestamp and index
        const timestamp = Date.now();
        const mockProducts: Product[] = Array(4)
          .fill(null)
          .map((_, index) => ({
            id: `${type}-${timestamp}-${index}`,
            title: `Sample Product ${index + 1}`,
            handle: `sample-product-${index + 1}`,
            description: "Sample description",
            availableForSale: true,
            featuredImage: {
              url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=2574",
              altText: `Sample Product ${index + 1}`,
            },
            priceRange: {
              minVariantPrice: {
                amount: "199.00",
                currencyCode: "ZAR",
              },
            },
            variants: {
              edges: [
                {
                  node: {
                    id: `variant-${type}-${timestamp}-${index}`,
                    availableForSale: true,
                    price: {
                      amount: "199.00",
                      currencyCode: "ZAR",
                    },
                    // Add these properties to match the ProductVariant type
                    title: `Sample Product ${index + 1}`,
                    quantityAvailable: 10,
                  },
                },
              ],
            },
          }));
        setProducts(mockProducts.filter((p) => p.id !== productId));
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [productId, type]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="aspect-[4/3] animate-pulse bg-muted rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div className="relative">
      {/* Navigation Buttons - Desktop Only */}
      {!isMobile && (
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
              <ProductCard product={product} />
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
