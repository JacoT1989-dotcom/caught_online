// File: components/inventory-card.tsx

"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import Image from "next/image";
import type { ProductInventory } from "@/types/inventory";

interface InventoryCardProps {
  product: ProductInventory;
}

export function InventoryCard({ product }: InventoryCardProps) {
  const totalStock = product.inventoryLevels.reduce(
    (sum, level) => sum + level.quantity,
    0
  );

  const stockStatus = (): {
    label: string;
    variant: "default" | "outline" | "secondary" | "destructive";
  } => {
    if (!product.availableForSale) {
      return { label: "Out of Stock", variant: "destructive" };
    }

    if (totalStock > 20) {
      return { label: "In Stock", variant: "default" };
    }

    if (totalStock > 0) {
      return { label: "Low Stock", variant: "secondary" };
    }

    return { label: "Out of Stock", variant: "destructive" };
  };

  const { label, variant } = stockStatus();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <CardTitle className="text-lg">{product.title}</CardTitle>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {product.price && (
          <p className="mb-2 text-lg font-semibold">{product.price}</p>
        )}

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{totalStock}</span> in stock
        </div>

        <Button
          size="sm"
          disabled={!product.availableForSale || totalStock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
