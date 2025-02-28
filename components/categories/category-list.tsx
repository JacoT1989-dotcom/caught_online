"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/config/categories";
import { Button } from "@/components/ui/button";

interface CategoryListProps {
  loading?: boolean;
  categoryImages?: Record<string, string>;
}

export function CategoryList({
  loading = false,
  categoryImages = {},
}: CategoryListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="aspect-[4/3] animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Categories</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="block group"
          >
            <Card
              className={cn(
                "overflow-hidden transition-all duration-300",
                "hover:border-[#41c8d2]/20 hover:shadow-lg"
              )}
            >
              <div className="aspect-[4/3] relative">
                {/* Replace img with Next.js Image component */}
                <div className="w-full h-full relative overflow-hidden">
                  <Image
                    src={
                      categoryImages[category.collection] ||
                      "/placeholder-product.jpg"
                    }
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={cn(
                      "object-cover transition-transform duration-500",
                      "group-hover:scale-110"
                    )}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-base font-medium text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="pt-4">
        <Button
          className="w-full bg-[#f6424a] hover:bg-[#f6424a]/90"
          size="lg"
          asChild
        >
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </div>
  );
}
