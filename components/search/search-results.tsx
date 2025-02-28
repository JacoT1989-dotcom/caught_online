"use client";

import { SearchResultsEmpty } from "./search-results-empty";
import { SearchResultsLoading } from "./search-results-loading";
import { SearchResultsPopular } from "./search-results-popular";
import { SearchResultsList } from "./search-results-list";
import { QuickView } from "@/components/shop/quick-view";
import { useState } from "react";
import { SearchProduct } from "@/lib/search";

interface SearchResultsProps {
  results: SearchProduct[];
  suggestedProducts?: SearchProduct[];
  isLoading: boolean;
  query: string;
  onProductClick: (handle: string) => void;
  onSearch: (query: string) => void;
}

export function SearchResults({
  results,
  suggestedProducts = [],
  isLoading,
  query,
  onProductClick,
  onSearch,
}: SearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<SearchProduct | null>(
    null
  );
  const [showQuickView, setShowQuickView] = useState(false);

  const handleQuickView = (product: SearchProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  if (isLoading) {
    return <SearchResultsLoading />;
  }

  if (results.length === 0 && query) {
    return <SearchResultsEmpty onSearch={onSearch} />;
  }

  if (!query) {
    return (
      <SearchResultsPopular
        suggestedProducts={suggestedProducts}
        onSearch={onSearch}
      />
    );
  }

  return (
    <div className="min-h-[300px]">
      <SearchResultsList
        results={results}
        onProductClick={onProductClick}
        onQuickView={handleQuickView}
      />

      {selectedProduct && (
        <QuickView
          product={{
            id: selectedProduct.id,
            title: selectedProduct.title,
            handle: selectedProduct.handle, // Add the missing handle property
            price: parseFloat(selectedProduct.price.amount),
            image: selectedProduct.image || "",
            availableForSale: selectedProduct.availableForSale,
          }}
          open={showQuickView}
          onOpenChange={setShowQuickView}
        />
      )}
    </div>
  );
}
