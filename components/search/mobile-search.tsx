"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchInput } from "./search-input";
import { SearchResults } from "./search-results";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
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
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "fixed inset-x-0 z-40 bg-background/95 backdrop-blur",
            "top-[calc(var(--header-height)+var(--banner-height))]",
            "h-[calc(100vh-var(--header-height)-var(--banner-height)-4rem)]",
            "border-t border-b"
          )}
        >
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center gap-4 p-4">
              <SearchInput
                query={query}
                onChange={handleSearch}
                onSearch={handleSearch}
                onClear={clearSearch}
                inputRef={inputRef}
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-auto h-[calc(100%-73px)]">
            <SearchResults
              results={results}
              isLoading={isLoading}
              query={query}
              onProductClick={handleProductClick}
              onSearch={handleSearch} // Add the missing onSearch prop
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
