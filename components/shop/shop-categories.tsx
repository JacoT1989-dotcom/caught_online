"use client";

import { CategoryButtons } from "@/components/search/category-buttons";
import { useRouter, useSearchParams } from "next/navigation";

export function ShopCategories() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("collection");

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("collection");
    } else {
      params.set("collection", category);
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      <CategoryButtons
        activeCategory={activeCategory || undefined}
        onCategoryClick={handleCategoryChange}
      />
    </div>
  );
}
