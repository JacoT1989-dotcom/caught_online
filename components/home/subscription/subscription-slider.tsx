"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { SubscriptionCard } from "./subscription-card";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionInterval,
} from "@/lib/types/subscription";
import { Button } from "@/components/ui/button";

export function SubscriptionSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
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
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div key={key} className="flex-[0_0_85%] min-w-0 pl-4 first:pl-4">
              <SubscriptionCard
                interval={key as SubscriptionInterval}
                label={plan.label}
                discount={plan.discount}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Object.keys(SUBSCRIPTION_PLANS).map((_, index) => (
          <Button
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              selectedIndex === index
                ? "w-6 bg-[#41c8d2]"
                : "w-1.5 bg-[#41c8d2]/20 hover:bg-[#41c8d2]/40"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
