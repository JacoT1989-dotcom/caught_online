import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-8 py-16">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-3xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn`&apos;`t find the product you`&apos;`re looking for.
          It may have been removed or is no longer available.
        </p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    </div>
  );
}
