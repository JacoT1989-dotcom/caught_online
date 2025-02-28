"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "./search-input";
import { SearchResults } from "./search-results";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SearchBarProps {
  onSelect?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchBar({
  onSelect,
  isOpen = false,
  onOpenChange,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, search } = useSearch();
  const debouncedSearch = useDebounce(search, 300);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim()) {
      await debouncedSearch(value);
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleProductClick = (handle: string) => {
    router.push(`/products/${handle}`);
    onSelect?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] bg-white p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>Search Products</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>

        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-4">
            <SearchInput
              query={query}
              onChange={handleSearch}
              onClear={clearSearch}
              inputRef={inputRef}
              onSearch={handleSearch} /* Add the missing onSearch prop */
            />
          </div>
        </div>

        <div className="overflow-auto h-[calc(100%-73px)]">
          <SearchResults
            results={results}
            isLoading={isLoading}
            query={query}
            onProductClick={handleProductClick}
            onSearch={handleSearch} /* Add the missing onSearch prop */
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
