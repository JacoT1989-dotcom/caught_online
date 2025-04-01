"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { shopifyFetch } from "@/lib/shopify/client";
import { useOnClickOutside } from "@/hooks/use-click-outside";

// Search query
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSearchRef = useRef("");
  const isTypingRef = useRef(false);
  const preventSyncRef = useRef(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if in a collection
  const inCollection = searchParams.has("collection");
  const collectionName = searchParams.get("collection") || "";

  // Sync search input with URL query parameter - run this on every URL change
  useEffect(() => {
    // Skip if we're typing (to prevent cursor jumping)
    if (isTypingRef.current || preventSyncRef.current) return;

    const urlQuery = searchParams.get("q");
    if (urlQuery !== null) {
      // Update input to match URL query
      setQuery(urlQuery);
    } else if (query && !urlQuery) {
      // Clear input if URL has no query
      setQuery("");
    }
  }, [searchParams, query]);

  // Handle clicks outside dropdown
  useOnClickOutside(dropdownRef, () => {
    setShowDropdown(false);
  });

  // Format price helper
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Search for products
  const performSearch = async (searchText: string) => {
    if (!searchText.trim() || searchText === lastSearchRef.current) {
      return;
    }

    lastSearchRef.current = searchText;

    try {
      setIsLoading(true);

      const enhancedQuery = searchText
        .split(" ")
        .filter((term) => term.trim())
        .map((term) => `*${term}*`)
        .join(" OR ");

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

  // Debounced search
  const debouncedSearch = useDebounce(performSearch, 400);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    isTypingRef.current = true;
    preventSyncRef.current = true;

    setQuery(value);

    if (value.trim()) {
      setShowDropdown(true);
      debouncedSearch(value);
    } else {
      setShowDropdown(false);
      setResults([]);

      // Clear search from URL if it exists
      if (searchParams.has("q")) {
        const params = new URLSearchParams();
        if (inCollection) {
          params.set("collection", collectionName);
        }
        router.push(`/products?${params.toString()}`);
      }
    }

    // Reset typing flag after a delay
    setTimeout(() => {
      isTypingRef.current = false;
      // Keep preventing sync a bit longer to avoid jumping
      setTimeout(() => {
        preventSyncRef.current = false;
      }, 300);
    }, 200);
  };

  // Clear search
  const handleClearSearch = () => {
    preventSyncRef.current = true;
    setQuery("");
    setResults([]);
    setShowDropdown(false);

    if (searchParams.has("q")) {
      const params = new URLSearchParams();
      if (inCollection) {
        params.set("collection", collectionName);
      }
      router.push(`/products?${params.toString()}`);
    }

    // Reset prevent sync flag after navigation
    setTimeout(() => {
      preventSyncRef.current = false;
    }, 300);
  };

  // Apply global search - ALWAYS overrides collection filter
  const applyGlobalSearch = (searchTerm: string) => {
    // Set prevent sync to true to avoid potential race conditions
    preventSyncRef.current = true;

    // Update input value first
    setQuery(searchTerm);

    // Create a new params object with ONLY the search term
    const params = new URLSearchParams();
    params.set("q", searchTerm);

    // Close dropdown
    setShowDropdown(false);

    // Navigate to products page with ONLY this search filter - no collection
    router.push(`/products?${params.toString()}`);

    // Reset prevent sync flag after navigation
    setTimeout(() => {
      preventSyncRef.current = false;
    }, 300);
  };

  // Submit search on Enter key
  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    applyGlobalSearch(query);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />

        <Input
          ref={inputRef}
          placeholder={
            inCollection
              ? `Search in ${
                  collectionName.charAt(0).toUpperCase() +
                  collectionName.slice(1)
                }...`
              : "Search products by name, type, description..."
          }
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) {
              setShowDropdown(true);
              debouncedSearch(query);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit();
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
                      // ALWAYS do a global search, ignoring collection
                      applyGlobalSearch(product.title);
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
                    // ALWAYS do a global search, ignoring collection
                    applyGlobalSearch(query);
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
