"use client";

import { useEffect, useState } from "react";
import { getBlogPosts } from "@/lib/shopify/blog";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for the blog post structure
interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  image?: {
    url: string;
  };
  handle: string;
}

// Define types for the recipe structure
interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  cookingTime: string;
  difficulty: string;
  servings: number;
  slug: string;
}

interface ProductRecipesProps {
  tags: string[];
  productType?: string;
}

export function ProductRecipes({ tags, productType }: ProductRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const posts = (await getBlogPosts()) as BlogPost[];

        if (!posts || posts.length === 0) {
          setRecipes([]);
          return;
        }

        // Normalize tags and product type for comparison
        const normalizedTags = tags.map((tag) => tag.toLowerCase());
        const normalizedProductType = productType?.toLowerCase() || "";

        // Get the main category (Fish, Shellfish, etc.)
        const mainCategory = normalizedProductType.includes("fish")
          ? "fish"
          : normalizedProductType.includes("shellfish")
          ? "shellfish"
          : normalizedProductType.includes("crumbed")
          ? "crumbed"
          : normalizedProductType.includes("smoked")
          ? "smoked"
          : "";

        // Filter posts that have matching tags OR category with the product
        const matchingRecipes = posts
          .filter((post: BlogPost) => {
            const postTags =
              post.tags?.map((tag: string) => tag.toLowerCase()) || [];

            // Check for tag matches
            const hasMatchingTag = postTags.some((tag: string) =>
              normalizedTags.some(
                (productTag) =>
                  tag.includes(productTag) || productTag.includes(tag)
              )
            );

            // Check for category match
            const hasMatchingCategory =
              mainCategory &&
              postTags.some((tag: string) => tag.includes(mainCategory));

            return hasMatchingTag || hasMatchingCategory;
          })
          .map(
            (post: BlogPost): Recipe => ({
              id: post.id,
              title: post.title,
              description: post.excerpt || "",
              image:
                post.image?.url ||
                "https://images.unsplash.com/photo-1485921325833-c519f76c4927",
              category: post.tags?.[0] || "Recipe",
              cookingTime: extractCookingTime(post.content) || "30 mins",
              difficulty: extractDifficulty(post.content) || "Medium",
              servings: extractServings(post.content) || 4,
              slug: post.handle,
            })
          );

        setRecipes(matchingRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError(
          error instanceof Error ? error : new Error("Failed to fetch recipes")
        );
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [tags, productType]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[300px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Unable to load recipes at this time.
        </p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No recipes found for this product yet.
        </p>
      </div>
    );
  }

  return <RecipeGrid recipes={recipes} />;
}

// Helper functions to extract recipe metadata from content
function extractCookingTime(content: string): string | null {
  const timeMatch = content.match(
    /cooking time:?\s*(\d+)\s*(min|minutes|mins)/i
  );
  return timeMatch ? `${timeMatch[1]} mins` : null;
}

function extractDifficulty(content: string): string | null {
  const difficultyMatch = content.match(/difficulty:?\s*(easy|medium|hard)/i);
  return difficultyMatch
    ? difficultyMatch[1].charAt(0).toUpperCase() + difficultyMatch[1].slice(1)
    : null;
}

function extractServings(content: string): number | null {
  const servingsMatch = content.match(/serves:?\s*(\d+)/i);
  return servingsMatch ? parseInt(servingsMatch[1]) : null;
}
