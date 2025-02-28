"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { collections } from "@/lib/collections";
import { Fish, Cookie, Cigarette, Waves } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { SearchProduct } from "@/types/search";
import { Crab } from "../icons";

const COLLECTION_ICONS: Record<string, any> = {
  fish: Fish,
  shellfish: Crab,
  crumbed: Cookie,
  smoked: Cigarette,
  "wild-caught": Waves,
};

interface SearchResultsPopularProps {
  suggestedProducts?: SearchProduct[];
  onSearch: (query: string) => void;
}

export function SearchResultsPopular({
  suggestedProducts = [],
  onSearch,
}: SearchResultsPopularProps) {
  // Default placeholder image to use if product image is undefined
  const placeholderImage = "/placeholder-product.jpg";

  return (
    <div className="p-6 space-y-8">
      {/* Quick Categories */}
      <div>
        <h2 className="text-sm font-medium mb-4">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {collections.slice(0, 6).map((collection) => {
            const Icon = COLLECTION_ICONS[collection.id] || Fish;
            return (
              <Link
                key={collection.handle}
                href={`/products?collection=${collection.handle}`}
                className="block group"
              >
                <Card
                  className={cn(
                    "p-4 hover:border-[#f6424a]/20 transition-colors",
                    "flex items-center gap-3"
                  )}
                >
                  <div className="p-2 rounded-lg bg-[#f6424a]/10">
                    <Icon className="h-4 w-4 text-[#f6424a]" />
                  </div>
                  <span className="text-sm font-medium">
                    {collection.title}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Popular Searches */}
      <div>
        <h2 className="text-sm font-medium mb-4">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {["Salmon", "Prawns", "Hake", "Tuna", "Calamari"].map((term) => (
            <Button
              key={term}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => onSearch(term)}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggested Products */}
      {suggestedProducts && suggestedProducts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-4">Popular Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {suggestedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="block group"
              >
                <Card className="overflow-hidden">
                  <div className="aspect-square relative">
                    {/* Ensure src is never undefined */}
                    <Image
                      src={product.image || placeholderImage}
                      alt={product.title || "Product image"}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-sm font-medium text-white">
                        {formatPrice(parseFloat(product.price?.amount || "0"))}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
