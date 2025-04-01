"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shopifyFetch } from "@/lib/shopify/client";
import { cn } from "@/lib/utils";

// Search query with collection information
const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int = 12) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 1) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    }
  }
`;

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  collections: {
    edges: Array<{
      node: {
        title: string;
      };
    }>;
  };
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // 1. Track when the search modal is opened
  useEffect(() => {
    if (open && typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "open_search_modal",
        source: "header",
      });
    }
  }, [open]);
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling

      // Focus the search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = ""; // Restore scrolling

      // Always clear the search when the modal closes
      setQuery("");
      setResults([]);
      setNoResults(false);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  // Not needed anymore - removing navigation tracking code
  useEffect(() => {
    // No navigation tracking needed with the new approach
    // The modal will naturally unmount during page navigation
  }, []);

  // Instead, make sure we restore scrolling if the modal closes for any reason
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Format price helper
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Perform search
  const performSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    try {
      setIsLoading(true);
      setNoResults(false);

      const enhancedQuery = searchText
        .split(" ")
        .filter((term) => term.trim())
        .map((term) => `*${term}*`)
        .join(" OR ");

      const { data } = await shopifyFetch({
        query: SEARCH_PRODUCTS_QUERY,
        variables: {
          query: enhancedQuery,
          first: 12, // Show more results in the modal
        },
        cache: "no-store",
      });

      if (data?.products?.edges && data.products.edges.length > 0) {
        setResults(data.products.edges.map((edge: any) => edge.node));
        setNoResults(false);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useDebounce(performSearch, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      debouncedSearch(value);

      // Track the search query event
      if (
        typeof window !== "undefined" &&
        window.dataLayer &&
        value.length > 2
      ) {
        window.dataLayer.push({
          event: "search_query",
          search_term: value,
        });
      }
    } else {
      setResults([]);
      setNoResults(false);
    }
  };

  // 3. Track search results
  useEffect(() => {
    // When search results change and query is not empty
    if (
      query &&
      !isLoading &&
      typeof window !== "undefined" &&
      window.dataLayer
    ) {
      window.dataLayer.push({
        event: "search_results",
        search_term: query,
        results_count: results.length,
        has_results: results.length > 0,
      });
    }
  }, [results, isLoading, query]);

  // Navigate to product using a hard redirect instead of client-side navigation
  const handleProductClick = (
    handle: string,
    title: string,
    position: number
  ) => {
    // Track the search result click
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "search_result_click",
        search_term: query,
        product_title: title,
        product_handle: handle,
        position: position,
      });
    }
    // Get the URL for the product
    const productUrl = `/products/${handle}`;

    // Use window.location for a full page navigation
    // This ensures the entire React app unmounts and remounts
    window.location.href = productUrl;

    // The modal will be destroyed as part of the full page reload
  };

  // Handle overlay click (close if clicking outside the modal)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-950 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search for products..."
              value={query}
              onChange={handleInputChange}
              className="pl-10 pr-10 py-6 text-lg"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setNoResults(false);
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : noResults ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">
                No products found for {query}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((product, index) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    handleProductClick(product.handle, product.title, index + 1)
                  }
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {product.featuredImage?.url ? (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <Search className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-semibold text-[#f6424a]">
                        {formatPrice(
                          product.priceRange.minVariantPrice.amount,
                          product.priceRange.minVariantPrice.currencyCode
                        )}
                      </p>
                      {product.collections.edges.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {product.collections.edges[0].node.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                Type to search for products...
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                Start typing to search for products...
              </p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
