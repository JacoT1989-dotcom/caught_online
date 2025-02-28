import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchNotFound() {
  return (
    <div className="container mx-auto px-8 py-16">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <Search className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-3xl font-bold">No Results Found</h2>
        <p className="text-muted-foreground">
          We couldn`&apos;`t find what you`&apos;`re looking for. Try searching
          with different keywords or browse our categories.
        </p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    </div>
  );
}
