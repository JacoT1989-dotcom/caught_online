"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useShopSearch } from "@/hooks/use-shop-search";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { shopifyFetch } from "@/lib/shopify/client";
import { useOnClickOutside } from "@/hooks/use-click-outside";

// Simplified search query
const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!, $first: Int = 5) {
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
        }
      }
    }
  }
`;

// Basic interface
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
}

export function ShopSearch() {
  // Initialize references and state
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const lastQueryRef = useRef("");
  const hasInitializedRef = useRef(false);

  // Local state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // On mount, get query from URL
  useEffect(() => {
    if (hasInitializedRef.current) return;

    const urlQuery = searchParams.get("q") || "";
    if (urlQuery) {
      setQuery(urlQuery);
    }

    hasInitializedRef.current = true;
  }, [searchParams]);

  // Format price helper
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Handle outside clicks
  useOnClickOutside(dropdownRef, () => {
    if (!isTypingRef.current) {
      setShowDropdown(false);
    }
  });

  // Perform search
  const performSearch = async (searchText: string) => {
    // Don't search empty strings or if the query hasn't changed
    if (!searchText.trim() || searchText === lastQueryRef.current) {
      return;
    }

    lastQueryRef.current = searchText;

    try {
      setIsLoading(true);

      // Prepare query with wildcards
      const enhancedQuery = searchText
        .split(" ")
        .filter((term) => term.trim())
        .map((term) => `*${term}*`)
        .join(" OR ");

      // Make request
      const { data } = await shopifyFetch({
        query: SEARCH_PRODUCTS_QUERY,
        variables: {
          query: enhancedQuery,
          first: 5,
        },
        cache: "no-store",
      });

      if (data?.products?.edges) {
        setResults(data.products.edges.map((edge: any) => edge.node));
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(performSearch, 400);

  // Debounce URL updates separately
  const updateURL = useDebounce((value: string) => {
    // Skip if value matches current URL query
    const currentQuery = searchParams.get("q");
    if (value.trim() === currentQuery) return;

    const params = new URLSearchParams(searchParams.toString());

    if (!value.trim()) {
      params.delete("q");
    } else {
      params.set("q", value);
    }

    router.push(`/products?${params.toString()}`);
  }, 800);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    isTypingRef.current = true;

    // Update input
    setQuery(value);

    // Handle search and dropdown
    if (value.trim()) {
      setShowDropdown(true);
      debouncedSearch(value);
    } else {
      // Clear results for empty input
      setShowDropdown(false);
      setResults([]);
      lastQueryRef.current = "";
    }

    // Update URL (debounced)
    updateURL(value);

    // Reset typing flag
    setTimeout(() => {
      isTypingRef.current = false;
    }, 300);
  };

  // Clear search handler
  const handleClearSearch = () => {
    // Clear everything
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    lastQueryRef.current = "";

    // Update URL if needed
    if (searchParams.has("q")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      router.push(`/products?${params.toString()}`);
    }
  };

  // Select result handler
  const handleSelectResult = (title: string) => {
    // Update query
    setQuery(title);
    setShowDropdown(false);

    // Navigate
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", title);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />

        <Input
          ref={inputRef}
          placeholder="Search products by name, type, description..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) {
              setShowDropdown(true);
              debouncedSearch(query);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              setShowDropdown(false);

              const params = new URLSearchParams(searchParams.toString());
              params.set("q", query);
              router.push(`/products?${params.toString()}`);
            }
          }}
          className={cn(
            "pl-10 pr-10 bg-white dark:bg-gray-950",
            "focus:ring-1 focus:ring-primary"
          )}
        />

        <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 z-10 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            query && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
                onClick={handleClearSearch}
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-950 border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="py-2">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectResult(product.title);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 relative flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                        {product.featuredImage?.url ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={product.featuredImage.url}
                              alt={
                                product.featuredImage.altText || product.title
                              }
                              className="object-cover"
                              fill
                              sizes="48px"
                              priority={false}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.productType || "Product"}
                        </p>
                        <p className="text-sm font-medium mt-0.5">
                          {formatPrice(
                            product.priceRange.minVariantPrice.amount,
                            product.priceRange.minVariantPrice.currencyCode
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectResult(query);
                  }}
                >
                  View all results for &quot;{query}&quot;
                </Button>
              </div>
            </>
          ) : isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
