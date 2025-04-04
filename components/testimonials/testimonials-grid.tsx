"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TESTIMONIALS } from "@/lib/constants/testimonials";
import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";

// Dynamically import TestimonialCard with loading state
const TestimonialCard = dynamic(
  () => import("./testimonial-card").then((mod) => mod.TestimonialCard),
  {
    loading: () => (
      <div className="aspect-[9/16] bg-muted rounded-lg animate-pulse" />
    ),
    ssr: false, // Disable SSR for video/audio components
  }
);

export function TestimonialsGrid() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    skipSnaps: false,
    inViewThreshold: 0.7, // Only consider slides as "in view" when 70% visible
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [visibleSlides, setVisibleSlides] = useState<string[]>([]);

  // Memoize scroll handlers to prevent recreating on each render
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    // Set up scroll snaps
    setScrollSnaps(emblaApi.scrollSnapList());

    // Set up event listeners
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());

      // Track visible slides
      const currentSlideIds = emblaApi
        .slidesInView()
        .map((index) => TESTIMONIALS[index].author);
      setVisibleSlides(currentSlideIds);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Initial call
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Pause/play videos when sliding
  useEffect(() => {
    const handlePointerDown = () => {
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
      });
    };

    const handlePointerUp = () => {
      setTimeout(() => {
        // Delay playing to ensure the carousel has settled
        visibleSlides.forEach((id) => {
          const videoElement = document.getElementById(
            `video-${id}`
          ) as HTMLVideoElement;
          if (videoElement) videoElement.play().catch(() => {});
        });
      }, 150);
    };

    const rootNode = emblaApi?.rootNode();
    if (rootNode) {
      rootNode.addEventListener("pointerdown", handlePointerDown);
      rootNode.addEventListener("pointerup", handlePointerUp);

      return () => {
        rootNode.removeEventListener("pointerdown", handlePointerDown);
        rootNode.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [emblaApi, visibleSlides]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={cn("flex", isMobile ? "gap-4" : "-ml-4")}>
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={cn(
                "min-w-0",
                isMobile ? "flex-[0_0_100%]" : "flex-[0_0_25%] pl-4"
              )}
            >
              <TestimonialCard
                id={testimonial.author}
                type={testimonial.type}
                src={
                  testimonial.type === "video"
                    ? testimonial.video
                    : testimonial.audio
                }
                author={testimonial.author}
                title={testimonial.title}
                followers={testimonial.followers || ""} // Provide a default empty string
                backgroundImage={
                  testimonial.type === "audio"
                    ? testimonial.backgroundImage
                    : undefined
                }
                isVisible={visibleSlides.includes(testimonial.author)}
                autoplay={index === selectedIndex}
                lazyLoad={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {isMobile ? (
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-6 bg-[#41c8d2]"
                  : "w-1.5 bg-[#41c8d2]/20 hover:bg-[#41c8d2]/40"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="absolute top-1/2 -translate-y-1/2 w-full">
          <div className="container flex justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
