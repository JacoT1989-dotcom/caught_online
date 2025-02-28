"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants/cart";
import { cn } from "@/lib/utils";

interface ShippingProgressProps {
  subtotal: number;
}

export function ShippingProgress({ subtotal }: ShippingProgressProps) {
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const qualified = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Using width classes instead of inline styles
  const getProgressWidth = () => {
    if (progress <= 0) return "w-0";
    if (progress <= 10) return "w-1/12";
    if (progress <= 20) return "w-2/12";
    if (progress <= 25) return "w-1/4";
    if (progress <= 30) return "w-3/12";
    if (progress <= 33) return "w-1/3";
    if (progress <= 40) return "w-4/12";
    if (progress <= 50) return "w-1/2";
    if (progress <= 60) return "w-6/12";
    if (progress <= 66) return "w-2/3";
    if (progress <= 70) return "w-7/12";
    if (progress <= 75) return "w-3/4";
    if (progress <= 80) return "w-8/12";
    if (progress <= 90) return "w-9/12";
    if (progress < 100) return "w-11/12";
    return "w-full";
  };

  return (
    <div className="space-y-1.5 px-4 py-2">
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full bg-[#f6424a] transition-all duration-500",
              getProgressWidth()
            )}
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {qualified ? (
          <motion.div
            key="celebration"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2 text-green-600"
          >
            <PartyPopper className="h-4 w-4" />
            <span className="text-xs">You have got free shipping!</span>
          </motion.div>
        ) : (
          <motion.p
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground"
          >
            Add {formatPrice(remaining)} for free shipping
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
