"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCartRegion } from "@/hooks/use-cart-region";
import { useInventory } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    handle: string;
    price: number;
    image: string;
  };
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { checkRegionSelection } = useCartRegion();
  const { loading, isAvailable, checkProductInventory } = useInventory();

  useEffect(() => {
    checkProductInventory(product.handle);
  }, [product.handle, checkProductInventory]);

  const handleAddToCart = async () => {
    // Check if region needs to be selected
    if (!checkRegionSelection()) {
      return;
    }

    setIsAdding(true);
    try {
      // Verify inventory one more time before adding
      await checkProductInventory(product.handle);

      if (!isAvailable) {
        toast.error("Product is currently out of stock");
        return;
      }

      addItem({
        id: product.id,
        variantId: product.id, // Added the required variantId property
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      });

      toast.success(`${product.title} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading || isAdding) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{isAdding ? "Adding..." : "Checking..."}</span>
      </Button>
    );
  }

  if (!isAvailable) {
    return (
      <Button
        variant="destructive"
        size={size}
        className={cn("gap-2", className)}
        disabled
      >
        <AlertCircle className="h-4 w-4" />
        <span>Out of Stock</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-4 w-4" />
      {size !== "icon" && <span>Add to Cart</span>}
    </Button>
  );
}
