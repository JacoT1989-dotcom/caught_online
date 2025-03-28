"use client";

import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Truck, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 1200;

// Base messages that will be duplicated
const baseMessages = [
  "Free Shipping Over R1200!",
  "Locally Wild-Caught Seafood Options",
  "Set your Seafood to Monthly Delivery and Save 10%!",
  "Next-Day Delivery Monday to Friday",
];

// Create a longer array by repeating the messages to ensure continuous scroll
const messages = [...baseMessages, ...baseMessages, ...baseMessages];

export function ShippingBanner() {
  const { items } = useCart();

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const qualified = subtotal >= FREE_SHIPPING_THRESHOLD;
  const hasItems = items.length > 0;

  return (
    <div className="shipping-banner bg-[#f6424a]/10 border-b border-[#f6424a]/20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-sm font-medium h-5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {hasItems ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2"
                >
                  {qualified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <PartyPopper className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">
                        You&apos;ve got free shipping!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#f6424a]" />
                      <span className="text-xs sm:text-sm">
                        Add{" "}
                        <span className="text-[#f6424a] font-semibold">
                          {formatPrice(remaining)}
                        </span>{" "}
                        for free shipping
                      </span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="relative w-full overflow-hidden">
                  <motion.div
                    key="scroll"
                    className="flex whitespace-nowrap"
                    initial={{ x: 0 }}
                    animate={{
                      x: "-33.33%",
                      transition: {
                        duration: 20, // Duration for one-third of the content
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                      },
                    }}
                  >
                    {/* Render messages three times to ensure smooth infinite scroll */}
                    {messages.map((message, i) => (
                      <span key={i} className="inline-block px-12">
                        {message}
                      </span>
                    ))}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {hasItems && (
            <div className="w-full max-w-md">
              <Progress
                value={progress}
                className={cn("h-1 bg-[#f6424a]/20", "[&>div]:bg-[#f6424a]")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
