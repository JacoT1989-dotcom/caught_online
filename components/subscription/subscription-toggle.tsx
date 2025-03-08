"use client";

import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, Percent, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/lib/types/subscription";

interface SubscriptionToggleProps {
  variant?: "default" | "compact";
}

export function SubscriptionToggle({
  variant = "default",
}: SubscriptionToggleProps) {
  const {
    isSubscriptionMode,
    selectedInterval,
    toggle,
    setInterval,
    getDiscount,
  } = useSubscriptionToggle();

  if (variant === "compact") {
    return (
      <AnimatePresence mode="wait">
        {isSubscriptionMode && selectedInterval ? (
          <motion.div
            key="interval-select"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex h-10 rounded-md border bg-background/95"
          >
            <div className="flex-1">
              <Select value={selectedInterval} onValueChange={setInterval}>
                <SelectTrigger
                  className={cn(
                    "h-10 w-full border-0 bg-transparent rounded-l-md",
                    "focus:ring-0 focus-visible:ring-0",
                    "focus:ring-offset-0 focus-visible:ring-offset-0"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <SelectItem key={key} value={key}>
                      {plan.label} ({plan.discount * 100}% off)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-l h-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none rounded-r-md"
                onClick={() => toggle()}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subscription-toggle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between gap-2 px-3 h-10 rounded-md border bg-background/95"
          >
            <div className="flex items-center gap-2">
              <Switch
                checked={isSubscriptionMode}
                onCheckedChange={toggle}
                className="data-[state=checked]:bg-[#f6424a]"
              />
              <Label className="text-sm font-medium">
                Subscribe & Save up to 10%
              </Label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-2 h-[44px] rounded-md border bg-background/95">
      <div className="flex items-center gap-2 min-w-max">
        <Switch
          checked={isSubscriptionMode}
          onCheckedChange={toggle}
          className="data-[state=checked]:bg-[#f6424a]"
        />
        <Label className="font-medium">Subscribe & Save</Label>
      </div>

      {isSubscriptionMode && (
        <div className="flex items-center gap-4 min-w-max">
          <CalendarRange className="hidden sm:block h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedInterval || "monthly"}
            onValueChange={setInterval}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <SelectItem key={key} value={key}>
                  {plan.label} ({plan.discount * 100}% off)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden sm:block text-sm font-medium text-[#f6424a] whitespace-nowrap">
            Save {(getDiscount() * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
