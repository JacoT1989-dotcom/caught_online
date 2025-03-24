"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Local Excellence",
    subtitle: "Shop our locally wild-caught fish",
    description:
      "Experience the finest selection of sustainably caught fish from South African waters.",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/tuna%20portion%20video-4AMZKl61jsI3wFwzsWqerUYH8z0V7T.mp4",
    cta: "Shop Wild Caught",
    href: "/products?collection=wild-caught-fish",
  },
  {
    title: "Sustainable Fishing",
    subtitle: "Supporting Local Communities",
    description:
      "Our partnerships with local fishing communities ensure sustainable practices and fair trade.",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/Kalk%20bay%20harbour%20-%20Man%20Throwing%20Water-9UYlJcGfdMpI6aPOJi5buJo7FFowtb.mp4",
    cta: "Learn More",
    href: "/sustainability",
  },
  {
    title: "From Ocean to Table",
    subtitle: "Premium Quality",
    description:
      "Expertly handled and delivered fresh to maintain the highest quality standards.",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/Lady-with-crab-hjZemnctoNj1NDHcvl2XPOd4NeAXu5.mp4",
    cta: "Shop Fresh Fish",
    href: "/products?collection=fresh-fish",
  },
];

export function WildCaught() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  // Using useCallback to memoize the onSelect function
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]); // onSelect is now in the dependency array

  return (
    <section className="px-2 md:px-8 py-6 sm:py-8">
      <div className="bg-background/95 rounded-xl overflow-hidden border">
        <div className="relative">
          {/* Navigation Buttons - Hidden on Mobile */}
          {!isMobile && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <div className="relative">
                    {/* Mobile Video - Shown only on mobile */}
                    <div className="lg:hidden">
                      <div className="relative w-full pt-[133%]">
                        <div className="absolute inset-0">
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover [filter:saturate(1.4)]"
                          >
                            <source src={slide.video} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">
                              {slide.title}
                            </h2>
                            <span className="text-2xl">🇿🇦</span>
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            {slide.subtitle}
                          </h3>
                          <p className="text-sm text-white/90">
                            {slide.description}
                          </p>
                          <Button
                            asChild
                            className="w-full bg-[#41c8d2] hover:bg-[#41c8d2]/90 text-white"
                          >
                            <Link href={slide.href}>{slide.cta}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Hidden on mobile */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-8  max-h-[500px]">
                      <div className="p-12 flex flex-col justify-center">
                        <div className="space-y-6 max-w-xl">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">
                              {slide.title}
                            </h2>
                            <span className="text-3xl">🇿🇦</span>
                          </div>

                          <h3 className="text-5xl font-bold text-[#41c8d2]">
                            {slide.subtitle}
                          </h3>

                          <p className="text-lg text-muted-foreground">
                            {slide.description}
                          </p>

                          <Button
                            asChild
                            size="lg"
                            className="bg-[#41c8d2] hover:bg-[#41c8d2]/90 text-white w-full sm:w-auto"
                          >
                            <Link href={slide.href}>{slide.cta}</Link>
                          </Button>
                        </div>
                      </div>

                      <div className="relative h-[500px]">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover [filter:saturate(1.4)]"
                        >
                          <source src={slide.video} type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2">
              {slides.map((_, index) => (
                <Button
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    selectedIndex === index
                      ? "w-6 bg-[#41c8d2]"
                      : "w-1.5 bg-[#41c8d2]/20 hover:bg-[#41c8d2]/40"
                  )}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
