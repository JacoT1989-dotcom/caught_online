"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

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
      };
    }>;
  };
}

interface ProductSliderProps {
  title: string;
  products: Product[];
  className?: string;
}

export function ProductSlider({
  title,
  products,
  className,
}: ProductSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const onSelect = () => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi]);

  // Calculate number of slides needed for 2x2 grid on mobile
  const slidesCount = isMobile
    ? Math.ceil(products.length / 4)
    : products.length;

  return (
    <section className={cn("px-0 md:px-4 py-8", className)}>
      <div className="p-0 md:p-6">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {isMobile
              ? // Mobile: 2x2 grid per slide
                Array.from({ length: slidesCount }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="flex-[0_0_100%] min-w-0 pl-4 first:pl-4 md:first:pl-0"
                  >
                    <div className="grid grid-cols-2 gap-4 pr-4">
                      {products
                        .slice(slideIndex * 4, (slideIndex + 1) * 4)
                        .map((product) => (
                          <div key={product.id} className="min-w-0">
                            <ProductCard product={product} />
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              : // Desktop: Single row
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-[0_0_280px] min-w-0 pl-4 first:pl-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
