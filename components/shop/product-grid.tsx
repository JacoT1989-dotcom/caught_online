"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { useShopDeals } from "@/hooks/use-shop-deals";
import { useShopSort } from "@/hooks/use-shop-sort";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { sortProducts } from "@/lib/utils/sorting";
import { filterProducts } from "@/lib/utils/filter-products";
import { cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Product } from "@/types/product";

// Updated Product type to match what ProductCard expects
export interface EnhancedProduct {
  id: string;
  title: string;
  handle: string;
  description: string; // Now required, no longer optional
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface ProductGridProps {
  products: Product[];
  searchQuery?: string;
  className?: string;
}

export function ProductGrid({
  products,
  searchQuery = "",
  className,
}: ProductGridProps) {
  const { showDeals } = useShopDeals();
  const { sortKey } = useShopSort();
  const { filters, clearFilters } = useShopFilters();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Number of items per page

  // First filter by search query
  const searchFilteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;

    return products.filter((product) => {
      const titleMatch = product.title.toLowerCase().includes(query);
      const descriptionMatch = product.description
        ?.toLowerCase()
        .includes(query);
      return titleMatch || descriptionMatch;
    });
  }, [products, searchQuery]);

  // Then apply deals filter if active
  const dealsFilteredProducts = useMemo(() => {
    if (!showDeals) return searchFilteredProducts;

    return searchFilteredProducts.filter((product) => {
      const variant = product.variants?.edges[0]?.node;
      return (
        variant?.compareAtPrice &&
        parseFloat(variant.compareAtPrice.amount) >
          parseFloat(variant.price.amount)
      );
    });
  }, [searchFilteredProducts, showDeals]);

  // Apply tag/type filters
  const filteredProducts = useMemo(() => {
    return filterProducts(dealsFilteredProducts, filters);
  }, [dealsFilteredProducts, filters]);

  // Finally apply sorting
  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortKey);
  }, [filteredProducts, sortKey]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show empty state if no products match filters
  if (sortedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Products Found</h3>
        <p className="text-muted-foreground mb-6">
          {searchQuery
            ? "No products match your search criteria."
            : "No products match the selected filters."}
        </p>
        {Object.values(filters).some((values) => values.length > 0) && (
          <Button variant="outline" onClick={clearFilters} className="mb-4">
            Clear All Filters
          </Button>
        )}
        <Button asChild>
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "grid gap-4 sm:gap-6",
          "grid-cols-2 md:grid-cols-4",
          "auto-rows-fr",
          className
        )}
      >
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              description: product.description || "", // Provide default value for optional description
            }}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-8 space-x-4">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant="outline"
        >
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}