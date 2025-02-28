"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

interface SearchResultsEmptyProps {
  onSearch: (query: string) => void;
}

export function SearchResultsEmpty({ onSearch }: SearchResultsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="p-4 rounded-full bg-[#f6424a]/5 mb-6">
        <Search className="h-8 w-8 text-[#f6424a]" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No results found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t find what you&apos;re looking for. Try searching for
        something else or browse our categories.
      </p>
      <Button
        asChild
        className="min-w-[200px] bg-[#f6424a] hover:bg-[#f6424a]/90"
      >
        <Link href="/products">Browse All Products</Link>
      </Button>
    </div>
  );
}
