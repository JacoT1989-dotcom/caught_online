"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSubscriptionToggle } from "@/hooks/use-subscription-toggle";
import type { SubscriptionInterval } from "@/lib/types/subscription";
import { cn } from "@/lib/utils";

interface SubscriptionButtonProps {
  interval: SubscriptionInterval;
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function SubscriptionButton({
  interval,
  children,
  className,
  variant = "default",
}: SubscriptionButtonProps) {
  const router = useRouter();
  const { toggle, setInterval } = useSubscriptionToggle();

  const handleClick = () => {
    // First set the interval
    setInterval(interval);
    // Then enable subscription mode
    toggle();
    // Navigate to products page with subscription parameter
    router.push(`/products?subscription=${interval}`);
  };

  return (
    <Button
      variant={variant}
      className={cn("gap-2", className)}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
