"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Fish, Cookie, Cigarette, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Crab } from "../icons";

const categories = [
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
    icon: Crab,
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
    href: "/products?collection=wild-caught",
    color: "bg-emerald-500",
  },
];

export function Categories() {
  return (
    <section className="px-4 py-8">
      <div className="rounded-xl border bg-gradient-to-br from-background via-background to-[#f6424a]/5 shadow-sm p-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="text-lg text-muted-foreground mt-2">
              Explore our wide selection of premium seafood
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} href={category.href}>
                  <div
                    className={cn(
                      "group h-full overflow-hidden transition-all duration-300 rounded-lg border bg-card text-card-foreground shadow-sm",
                      "hover:border-[#f6424a]/20 hover:shadow-lg"
                    )}
                  >
                    <div className="p-6 text-center">
                      <div
                        className={cn(
                          "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                          "group-hover:scale-110 transition-transform duration-300",
                          category.color
                        )}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
