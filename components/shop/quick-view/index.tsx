"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { QuickViewContent } from "./quick-view-content";

interface QuickViewProps {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    variantId?: string;
    handle: string; // Added the missing 'handle' property
    availableForSale?: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: () => void;
}

export function QuickView({
  product,
  open,
  onOpenChange,
  onLocationSelect,
}: QuickViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>Quick Add - {product.title}</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>
        <QuickViewContent
          product={product}
          onClose={() => onOpenChange(false)}
          onLocationSelect={onLocationSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
