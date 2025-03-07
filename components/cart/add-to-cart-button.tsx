"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { trackAddToCart } from "@/lib/analytics";
import { syncCartWithShopify } from "@/lib/shopify/cart-sync";

// Define proper types for product and variant
interface ProductVariant {
  id: string;
  price: string;
  compareAtPrice?: string;
}

interface Product {
  id: string;
  title: string;
  price: string;
  featuredImage?: {
    url: string;
  };
  images?: Array<{
    url: string;
  }>;
}

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant;
}

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      // Ensure we have a valid variantId
      if (!variant?.id) {
        console.error("Product variant ID is missing", { product, variant });
        toast.error("Could not add to cart", {
          description: "Product information is incomplete",
        });
        return;
      }

      const item: CartItem = {
        id: product.id,
        title: product.title,
        price: parseFloat(variant.price || product.price),
        originalPrice: variant.compareAtPrice
          ? parseFloat(variant.compareAtPrice)
          : undefined,
        image: product.featuredImage?.url || product.images?.[0]?.url || "",
        quantity: 1,
        variantId: variant.id, // Ensure this is the Shopify variant ID
      };

      addItem(item);

      // Track with GTM
      const trackableProduct = {
        id: product.id,
        title: product.title,
        price: parseFloat(variant.price || product.price),
      };
      trackAddToCart({
        id: product.id,
        title: product.title,
        price: parseFloat(variant.price || product.price),
        variantId: variant.id,
        quantity: 1,
      });

      await syncCartWithShopify([
        {
          variantId: variant.id,
          quantity: 1,
        },
      ]);

      toast.success("Added to cart", {
        description: product.title,
      });

      // Use the global tracking function if available
      if (typeof window !== "undefined" && window.trackAddToCart) {
        window.trackAddToCart(trackableProduct);
      }

      toast.success("Added to cart", {
        description: product.title,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button onClick={handleAddToCart} disabled={isAdding} className="w-full">
      {isAdding ? (
        "Adding..."
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
