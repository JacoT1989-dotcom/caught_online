"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  PauseCircle,
  SkipForward,
  Settings,
  CalendarRange,
  Truck,
  PackageSearch,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: PackageSearch,
    title: "Customize Your Box",
    description:
      "Pick your own favorite seafood items from our premium selection for your seafood box",
    gradient: "from-[#41c8d2]/5 to-[#41c8d2]/10",
  },
  {
    icon: PauseCircle,
    title: "Pause Anytime",
    description: "Going on holiday? Pause your subscription with one click",
    gradient: "from-[#f6424a]/5 to-[#f6424a]/10",
  },
  {
    icon: SkipForward,
    title: "Skip Deliveries",
    description: "Need to skip a month? No problem, skip any delivery",
    gradient: "from-[#41c8d2]/5 to-[#41c8d2]/10",
  },
  {
    icon: Settings,
    title: "Change Products",
    description: "Swap items in your box before each delivery",
    gradient: "from-[#f6424a]/5 to-[#f6424a]/10",
  },
  {
    icon: CalendarRange,
    title: "Choose Your Date",
    description: "Select your preferred delivery date",
    gradient: "from-[#41c8d2]/5 to-[#41c8d2]/10",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free delivery on all subscription orders",
    gradient: "from-[#f6424a]/5 to-[#f6424a]/10",
  },
];

export function SubscriptionPlans() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });
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
    <section className="px-4 py-6 sm:py-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#41c8d2]">
          Create your own Monthly Seafood Box and Save 10%
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join our subscription service and enjoy premium seafood delivered on
          your schedule
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              "p-6 hover:border-[#f6424a]/20 transition-colors overflow-hidden relative",
              "before:absolute before:inset-0 before:bg-gradient-to-br",
              `before:${feature.gradient}`,
              "before:opacity-50 before:z-0"
            )}
          >
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm">
                <feature.icon className="h-6 w-6 text-[#f6424a]" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex-[0_0_85%] min-w-0 pl-4 first:pl-4"
              >
                <Card
                  className={cn(
                    "p-6 hover:border-[#f6424a]/20 transition-colors h-full overflow-hidden relative",
                    "before:absolute before:inset-0 before:bg-gradient-to-br",
                    `before:${feature.gradient}`,
                    "before:opacity-50 before:z-0"
                  )}
                >
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <div className="p-3 rounded-full bg-white shadow-sm">
                      <feature.icon className="h-6 w-6 text-[#f6424a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {features.map((_, index) => (
            <button
              key={index}
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
      </div>
    </section>
  );
}
