"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Tag, X } from "lucide-react";
import { checkCouponCode } from "@/lib/shopify/coupons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CouponInputProps {
  onApply: (discount: { type: "percentage" | "fixed"; value: number }) => void;
  onRemove: () => void;
  className?: string;
}

export function CouponInput({
  onApply,
  onRemove,
  className,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const result = await checkCouponCode(code);

      if (result.valid) {
        // Ensure type is always 'percentage' or 'fixed'
        const discountType: "percentage" | "fixed" =
          result.type === "percentage" ? "percentage" : "fixed";

        setAppliedCode(code);
        onApply({
          type: discountType,
          value: result.value,
        });
        toast.success("Coupon applied successfully");
      } else {
        toast.error("Invalid coupon code", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setAppliedCode(null);
    onRemove();
  };

  if (appliedCode) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 bg-muted rounded-md",
          className
        )}
      >
        <Tag className="h-4 w-4 text-[#f6424a]" />
        <span className="text-sm font-medium flex-1">{appliedCode}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:text-red-600"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={loading || !code.trim()}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
      </Button>
    </form>
  );
}
