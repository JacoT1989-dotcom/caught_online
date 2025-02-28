"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TestimonialCard } from "./testimonial-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TESTIMONIALS } from "@/lib/constants/testimonials";
import { useMediaQuery } from "@/hooks/use-media-query";

export function TestimonialsGrid() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;

    // Set up scroll snaps
    setScrollSnaps(emblaApi.scrollSnapList());

    // Set up event listeners
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
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

  const scrollTo = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={cn("flex", isMobile ? "gap-4" : "-ml-4")}>
          {TESTIMONIALS.map((testimonial) => (
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
                followers={testimonial.followers}
                backgroundImage={
                  testimonial.type === "audio"
                    ? testimonial.backgroundImage
                    : undefined
                }
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
