'use client';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { cn } from '@/lib/utils';

interface ProductGridSectionProps {
  title: string;
  products: any[];
  className?: string;
  subscriptionMode?: boolean;
}

export function ProductGridSection({ 
  title, 
  products, 
  className,
  subscriptionMode = false 
}: ProductGridSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    slidesToScroll: 4,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  // Sort products: in-stock first, out-of-stock last
  const sortedProducts = [...products].sort((a, b) => {
    const aAvailable = a.variants?.edges[0]?.node?.availableForSale ?? a.availableForSale;
    const bAvailable = b.variants?.edges[0]?.node?.availableForSale ?? b.availableForSale;
    
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return 0;
  });

  return (
    <section className={cn("px-0 md:px-4 py-8", className)}>
      <div className="p-0 md:p-6">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!prevBtnEnabled}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!nextBtnEnabled}
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {isMobile ? (
              // Mobile: 2x2 grid per slide
              Array.from({ length: Math.ceil(sortedProducts.length / 4) }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex-[0_0_100%] min-w-0 pl-4 first:pl-4 md:first:pl-0">
                  <div className="grid grid-cols-2 gap-4 pr-4">
                    {sortedProducts.slice(slideIndex * 4, (slideIndex + 1) * 4).map((product) => (
                      <div key={product.id} className="min-w-0">
                        <ProductCard 
                          product={product} 
                          forceSubscription={subscriptionMode}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Desktop: Show 4 products at a time
              sortedProducts.map((product) => (
                <div key={product.id} className="flex-[0_0_25%] min-w-0 pl-4 first:pl-0">
                  <ProductCard 
                    product={product} 
                    forceSubscription={subscriptionMode}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}