import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export default function RecipeNotFound() {
  return (
    <div className="container mx-auto px-8 py-16">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-3xl font-bold">Recipe Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn`&apos;`t find the recipe you`&apos;`re looking for.
          It may have been removed or is no longer available.
        </p>
        <Button asChild>
          <Link href="/recipes">Browse All Recipes</Link>
        </Button>
      </div>
    </div>
  );
}
