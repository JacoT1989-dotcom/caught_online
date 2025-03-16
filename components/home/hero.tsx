"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import { cn } from "@/lib/utils";
import { Truck, Clock, Fish, Percent } from "lucide-react";
import { useState, useEffect } from "react";

// WhatsApp SVG Logo component
function WhatsAppLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className="mr-2"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Hero() {
  const router = useRouter();
  const { toggle, setInterval } = useSubscriptionToggle();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/27647045283?text=Hi%20I%27d%20like%20to%20shop%20with%20your%20AI%20assistant",
      "_blank"
    );
  };

  // Video placeholder for initial render
  const videoPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23f0f0f0'%3E%3Crect width='400' height='300' /%3E%3C/svg%3E";

  return (
    <section className="pt-2 md:pt-4">
      <div className="px-2 md:px-8">
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Content Column */}
            <div className="relative z-10 flex items-center">
              <div className="w-full lg:max-w-xl space-y-3 lg:space-y-4">
                {/* Main Headings */}
                <div className="text-center lg:text-left space-y-2">
                  <h1
                    className={cn(
                      "font-bold font-lato text-[#f6424a]",
                      "text-3xl"
                    )}
                  >
                    Enjoy incredible seafood at home every week!
                  </h1>
                  <p
                    className={cn(
                      "font-medium text-muted-foreground",
                      "text-sm sm:text-base md:text-lg lg:text-xl"
                    )}
                  >
                    Pre-Portioned restaurant quality seafood delivered straight
                    to your door in Cape Town, Johannesburg, Pretoria, and
                    Durban!
                  </p>
                </div>

                {/* Mobile Video */}
                <div className="block lg:hidden relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  {isClient && (
                    <>
                      <div
                        className={`absolute inset-0 ${videoLoaded ? "hidden" : "flex"} items-center justify-center bg-gray-100`}
                      >
                        <span className="text-gray-500">Loading...</span>
                      </div>
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setVideoLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-cover [filter:saturate(1.2)] ${videoLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                        poster={videoPlaceholder}
                        preload="metadata"
                      >
                        <source
                          src="https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/Prawn%20Pasta-jGUf98NpB9MiKm54yMIBXyLtB9ooqv.mp4"
                          type="video/mp4"
                        />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                  )}
                </div>

                {/* Ratings */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-base sm:text-xl text-[#41c8d2]"
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">
                    50 000+ Boxes Delivered
                  </span>
                </div>

                {/* Features */}
                <div className="hidden sm:flex flex-wrap justify-center lg:justify-start gap-2">
                  {[
                    { icon: Truck, text: "Next Day Delivery" },
                    { icon: Clock, text: "Order by 10PM" },
                    { icon: Fish, text: "Fresh Guaranteed" },
                    { icon: Percent, text: "Save up to 30% vs Retail" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="inline-flex items-center whitespace-nowrap bg-[#41c8d2]/10 rounded-full px-3 py-1.5 border border-[#41c8d2]/20"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#41c8d2] flex-shrink-0" />
                      <span className="ml-1.5 text-xs sm:text-sm font-medium">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-[#f6424a] hover:bg-[#f6424a]/90 text-white"
                  >
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#25D366] hover:bg-[#25D366]/90 text-white flex items-center justify-center"
                    onClick={handleWhatsAppClick}
                  >
                    <WhatsAppLogo />
                    Shop with AI on WhatsApp®
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Video Column */}
            <div className="hidden lg:block relative h-[500px]">
              {isClient && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className={`absolute inset-0 ${videoLoaded ? "hidden" : "flex"} items-center justify-center bg-gray-100 rounded-l-3xl`}
                  >
                    <span className="text-gray-500">Loading...</span>
                  </div>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setVideoLoaded(true)}
                    className={`absolute right-0 w-[120%] h-full object-cover rounded-l-3xl shadow-2xl [filter:saturate(1.2)] ${videoLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                    poster={videoPlaceholder}
                    preload="metadata"
                  >
                    <source
                      src="https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Homepage%20Video/Prawn%20Pasta-jGUf98NpB9MiKm54yMIBXyLtB9ooqv.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
