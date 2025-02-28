"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TestimonialCard } from "./testimonial-card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TestimonialsSliderProps {
  testimonials: Array<{
    id: string; // Added required id property
    type: "video" | "audio";
    author: string;
    title: string;
    followers?: string;
    video?: string;
    audio?: string;
    backgroundImage?: string; // Added optional backgroundImage
  }>;
}

export function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <TestimonialCard
                id={testimonial.id}
                type={testimonial.type}
                src={
                  testimonial.type === "video"
                    ? testimonial.video!
                    : testimonial.audio!
                }
                author={testimonial.author}
                title={testimonial.title}
                followers={testimonial.followers}
                backgroundImage={testimonial.backgroundImage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
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
  );
}
