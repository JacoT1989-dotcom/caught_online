import { RecipeCard } from './recipe-card';

interface RecipeGridProps {
  recipes: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    cookingTime: string;
    difficulty: string;
    servings: number;
    slug: string;
  }>;
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}