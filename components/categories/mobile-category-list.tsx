"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Fish,
  Cookie,
  Cigarette,
  Waves,
  Percent,
  CalendarRange,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface Category {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  featured?: boolean;
}

const categories: Category[] = [
  {
    title: "On Sale",
    description: "Shop our current deals",
    icon: Percent,
    href: "/products?deals=true",
    color: "bg-[#f6424a]",
    featured: true,
  },
  {
    title: "Subscribe & Save",
    description: "Save up to 10% on regular deliveries",
    icon: CalendarRange,
    href: "/products?subscription=true",
    color: "bg-[#41c8d2]",
    featured: true,
  },
  {
    title: "Fresh Fish",
    description: "Premium quality fresh fish",
    icon: Fish,
    href: "/products?collection=fish",
    color: "bg-blue-500",
  },
  {
    title: "Shellfish",
    description: "Delicious shellfish selection",
    icon: Fish,
    href: "/products?collection=shellfish",
    color: "bg-red-500",
  },
  {
    title: "Crumbed",
    description: "Ready to cook favorites",
    icon: Cookie,
    href: "/products?collection=crumbed",
    color: "bg-amber-500",
  },
  {
    title: "Smoked & Cured",
    description: "Traditional smoking methods",
    icon: Cigarette,
    href: "/products?collection=smoked",
    color: "bg-orange-500",
  },
  {
    title: "Wild Caught",
    description: "Sustainably sourced seafood",
    icon: Waves,
    href: "/products?collection=wild",
    color: "bg-emerald-500",
  },
];

export function MobileCategoryList() {
  const featuredCategories = categories.filter((cat) => cat.featured);
  const regularCategories = categories.filter((cat) => !cat.featured);

  return (
    <div className="container py-6 space-y-8">
      {/* Featured Categories */}
      <div className="grid grid-cols-2 gap-4">
        {featuredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.title} href={category.href}>
              <Card
                className={cn(
                  "h-full p-4 transition-colors",
                  "hover:border-[#f6424a]/20 hover:shadow-lg"
                )}
              >
                <div className="flex flex-col gap-2">
                  <div className={cn("p-2 rounded-lg w-fit", category.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Regular Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-1">Shop by Category</h2>
        <div className="space-y-2">
          {regularCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.title} href={category.href}>
                <Card
                  className={cn(
                    "transition-colors",
                    "hover:border-[#f6424a]/20 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={cn("p-2 rounded-lg", category.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Products Button */}
      <div className="sticky bottom-20 pt-4 pb-2 bg-gradient-to-t from-background via-background to-background/0">
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
