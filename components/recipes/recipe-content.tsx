"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Users, ChefHat } from "lucide-react";
import { shopifyFetch } from "@/lib/shopify/client";
import { ProductCard } from "@/components/shop/product-card";
import { RecipeCard } from "./recipe-card";

interface Recipe {
  title: string;
  description: string;
  image: string;
  category: string;
  cookingTime: string;
  difficulty: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  slug: string;
}

interface RecipeContentProps {
  recipe: Recipe;
}

const GET_PRODUCTS_BY_TAG = `
  query GetProductsByTag($tag: String!) {
    products(first: 4, query: $tag) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
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
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Placeholder related recipes - in a real app this would come from an API/CMS
const relatedRecipes = [
  {
    id: "2",
    title: "Garlic Butter Prawns",
    description:
      "Quick and easy garlic butter prawns that are perfect for a weeknight dinner.",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2924&auto=format&fit=crop",
    category: "Shellfish",
    cookingTime: "15 mins",
    difficulty: "Easy",
    servings: 2,
    slug: "garlic-butter-prawns",
  },
  {
    id: "3",
    title: "Seafood Paella",
    description:
      "A classic Spanish seafood paella loaded with fresh fish, prawns, and mussels.",
    image:
      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=2940&auto=format&fit=crop",
    category: "Mixed Seafood",
    cookingTime: "45 mins",
    difficulty: "Medium",
    servings: 6,
    slug: "seafood-paella",
  },
  {
    id: "4",
    title: "Crispy Fish Tacos",
    description: "Battered fish tacos with fresh slaw and chipotle mayo.",
    image:
      "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?q=80&w=2940&auto=format&fit=crop",
    category: "Fish",
    cookingTime: "30 mins",
    difficulty: "Medium",
    servings: 4,
    slug: "crispy-fish-tacos",
  },
];

export function RecipeContent({ recipe }: RecipeContentProps) {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const { data } = await shopifyFetch({
          query: GET_PRODUCTS_BY_TAG,
          variables: { tag: recipe.category },
          cache: "no-store",
        });

        if (data?.products?.edges) {
          setRelatedProducts(data.products.edges.map(({ node }: any) => node));
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [recipe.category]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge
          variant="secondary"
          className="mb-4 bg-[#f6424a] text-white hover:bg-[#f6424a]/90"
        >
          {recipe.category}
        </Badge>
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {recipe.description}
        </p>
      </div>

      {/* Recipe Image */}
      <div className="aspect-video relative rounded-xl overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover"
        />
      </div>

      {/* Recipe Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-[#f6424a]" />
          <div className="text-sm font-medium">{recipe.cookingTime}</div>
          <div className="text-xs text-muted-foreground">Cooking Time</div>
        </Card>
        <Card className="p-4 text-center">
          <Users className="h-6 w-6 mx-auto mb-2 text-[#f6424a]" />
          <div className="text-sm font-medium">Serves {recipe.servings}</div>
          <div className="text-xs text-muted-foreground">Servings</div>
        </Card>
        <Card className="p-4 text-center">
          <ChefHat className="h-6 w-6 mx-auto mb-2 text-[#f6424a]" />
          <div className="text-sm font-medium">{recipe.difficulty}</div>
          <div className="text-xs text-muted-foreground">Difficulty</div>
        </Card>
      </div>

      {/* Recipe Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <Card className="p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#f6424a]" />
                <span className="text-sm">{ingredient}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Instructions */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#f6424a]/10 text-[#f6424a] text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-sm">{instruction}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Products to use with this recipe */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Products to use with this recipe
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Related Recipes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          You might also like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedRecipes.map((relatedRecipe) => (
            <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
          ))}
        </div>
      </div>
    </div>
  );
}
