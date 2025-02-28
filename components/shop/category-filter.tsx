"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { shopifyFetch } from "@/lib/shopify/client";

interface Category {
  label: string;
  value: string;
  subcategories?: string[];
}

interface CategoryFilterProps {
  activeCategory?: string;
}

// Define the shape of the data returned from Shopify
interface ShopifyProductTypesResponse {
  data?: {
    productTypes?: {
      edges: Array<{
        node: string;
      }>;
    };
  };
}

export function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([
    { label: "All Products", value: "" },
    { label: "Fish", value: "fish" },
    { label: "Shellfish", value: "shellfish" },
    { label: "Prepared", value: "prepared" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<string>("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response: ShopifyProductTypesResponse = await shopifyFetch({
          query: `
            query GetProductTypes {
              productTypes(first: 250) {
                edges {
                  node
                }
              }
            }
          `,
        });

        if (response.data?.productTypes?.edges) {
          const types = response.data.productTypes.edges.map(
            ({ node }: { node: string }) => node
          );

          // Group categories
          const fishTypes = types.filter(
            (type: string) =>
              type.toLowerCase().includes("fish") &&
              !type.toLowerCase().includes("shellfish")
          );

          const shellfishTypes = types.filter(
            (type: string) =>
              type.toLowerCase().includes("shellfish") ||
              type.toLowerCase().includes("prawns") ||
              type.toLowerCase().includes("crab") ||
              type.toLowerCase().includes("lobster")
          );

          const preparedTypes = types.filter(
            (type: string) =>
              type.toLowerCase().includes("prepared") ||
              type.toLowerCase().includes("smoked") ||
              type.toLowerCase().includes("crumbed")
          );

          setCategories([
            { label: "All Products", value: "" },
            {
              label: "Fish",
              value: "fish",
              subcategories: fishTypes,
            },
            {
              label: "Shellfish",
              value: "shellfish",
              subcategories: shellfishTypes,
            },
            {
              label: "Prepared",
              value: "prepared",
              subcategories: preparedTypes,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleParentClick = (value: string) => {
    setSelectedParent(value === selectedParent ? "" : value);
  };

  const activeParentCategory = categories.find(
    (cat) =>
      cat.value === activeCategory ||
      cat.subcategories?.includes(activeCategory || "")
  );

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full",
              activeCategory === category.value ||
                activeParentCategory?.value === category.value
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            )}
            onClick={() => handleParentClick(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {selectedParent && (
        <div className="flex flex-wrap gap-2 pt-2 pl-4 border-l-2">
          {categories
            .find((cat) => cat.value === selectedParent)
            ?.subcategories?.map((subcat) => (
              <Button
                key={subcat}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full text-sm",
                  activeCategory === subcat
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : ""
                )}
                asChild
              >
                <Link href={`/products?category=${subcat.toLowerCase()}`}>
                  {subcat}
                </Link>
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
