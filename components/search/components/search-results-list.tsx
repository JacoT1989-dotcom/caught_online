"use client";

import { CartQuantity } from "@/components/cart/cart-quantity";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, AlertCircle } from "lucide-react";
import Image from "next/image"; // Add this import
import type { CartItem } from "@/hooks/use-cart";
import type { SearchProduct } from "../hooks/use-search-results";

interface SearchResultsListProps {
  results: SearchProduct[];
  cartItems: CartItem[];
  onProductClick: (handle: string) => void;
  onQuickView: (product: SearchProduct, e: React.MouseEvent) => void;
}

export function SearchResultsList({
  results,
  cartItems,
  onProductClick,
  onQuickView,
}: SearchResultsListProps) {
  return (
    <div className="space-y-4 p-4">
      {results.map((product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        const price = parseFloat(product.price.amount);

        return (
          <div
            key={product.id}
            className="flex gap-6 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onProductClick(product.handle)}
          >
            {product.image && (
              <div className="relative h-32 w-32 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="128px"
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-medium">{product.title}</h3>
              <p className="text-[#f6424a] font-semibold mt-1">
                {formatPrice(price)}
              </p>
              <div className="mt-auto">
                {cartItem ? (
                  <CartQuantity productId={product.id} className="w-[140px]" />
                ) : (
                  <Button
                    variant="secondary"
                    className="gap-2 min-w-[120px]"
                    onClick={(e) => onQuickView(product, e)}
                    disabled={!product.availableForSale}
                  >
                    {product.availableForSale ? (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Out of Stock
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
