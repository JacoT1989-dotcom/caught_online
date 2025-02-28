"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { QuickView } from "@/components/shop/quick-view";
import { RegionSelector } from "@/components/region/region-selector";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchResultsLoading } from "../search-results-loading";
import { SearchResultsEmpty } from "./../search-results-empty";
import { SearchResultsPopular } from "./../search-results-popular";
import { SearchResultsList } from "../components/search-results-list";

interface SearchResultsProps {
  results: any[];
  isLoading: boolean;
  query: string;
  onProductClick: (handle: string) => void;
}

export function SearchResults({
  results,
  isLoading,
  query,
  onProductClick,
}: SearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showRegionPrompt, setShowRegionPrompt] = useState(false);
  const { items } = useCart();

  const handleQuickView = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants?.edges[0]?.node;
    setSelectedProduct({
      id: product.id,
      title: product.title,
      price: parseFloat(
        variant?.price?.amount || product.priceRange.minVariantPrice.amount
      ),
      image: product.featuredImage?.url || "",
      availableForSale: variant?.availableForSale ?? product.availableForSale,
    });
    setShowQuickView(true);
  };

  if (isLoading) {
    return <SearchResultsLoading />;
  }

  if (results.length === 0 && query) {
    return (
      <SearchResultsEmpty
        onSearch={function (query: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
  }

  if (!query) {
    return (
      <SearchResultsPopular
        onSearch={function (query: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
  }

  return (
    <>
      <SearchResultsList
        results={results}
        cartItems={items}
        onProductClick={onProductClick}
        onQuickView={handleQuickView}
      />

      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          open={showQuickView}
          onOpenChange={setShowQuickView}
          onLocationSelect={() => setShowRegionPrompt(true)}
        />
      )}

      <Dialog open={showRegionPrompt} onOpenChange={setShowRegionPrompt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>
            <VisuallyHidden>Select Your Region</VisuallyHidden>
          </DialogTitle>
          <RegionSelector forceOpen showPostalCheck />
        </DialogContent>
      </Dialog>
    </>
  );
}
