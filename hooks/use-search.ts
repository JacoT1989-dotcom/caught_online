"use client";

import { useState, useEffect } from "react";
import { searchProducts } from "@/lib/shopify/search";
import { useDebounce } from "./use-debounce";
import type { SearchProduct } from "@/types/search";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<SearchProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load suggested products on mount
  useEffect(() => {
    async function loadSuggested() {
      try {
        // The searchProducts function expects a string, not an object
        // We need to either modify the function or use it differently
        const products = await searchProducts("");
        setSuggestedProducts(products);
      } catch (error) {
        console.error("Error loading suggested products:", error);
      }
    }
    loadSuggested();
  }, []);

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchProducts(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useDebounce(search, 300);

  return {
    query,
    results,
    suggestedProducts,
    isLoading,
    error,
    setQuery,
    search: debouncedSearch,
    clear: () => {
      setQuery("");
      setResults([]);
      setError(null);
    },
  };
}
