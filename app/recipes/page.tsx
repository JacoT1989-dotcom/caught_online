import { RecipeGrid } from '@/components/recipes/recipe-grid';
import { Container } from '@/components/ui/container';

// Placeholder recipe data
const recipes = [
  {
    id: '1',
    title: 'Grilled Salmon with Lemon Butter',
    description: 'A delicious and healthy grilled salmon recipe with a zesty lemon butter sauce.',
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=2824&auto=format&fit=crop',
    category: 'Fish',
    cookingTime: '25 mins',
    difficulty: 'Easy',
    servings: 4,
    slug: 'grilled-salmon-lemon-butter'
  },
  {
    id: '2',
    title: 'Garlic Butter Prawns',
    description: 'Quick and easy garlic butter prawns that are perfect for a weeknight dinner.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2924&auto=format&fit=crop',
    category: 'Shellfish',
    cookingTime: '15 mins',
    difficulty: 'Easy',
    servings: 2,
    slug: 'garlic-butter-prawns'
  },
  {
    id: '3',
    title: 'Seafood Paella',
    description: 'A classic Spanish seafood paella loaded with fresh fish, prawns, and mussels.',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=2940&auto=format&fit=crop',
    category: 'Mixed Seafood',
    cookingTime: '45 mins',
    difficulty: 'Medium',
    servings: 6,
    slug: 'seafood-paella'
  },
  {
    id: '4',
    title: 'Crispy Fish Tacos',
    description: 'Battered fish tacos with fresh slaw and chipotle mayo.',
    image: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?q=80&w=2940&auto=format&fit=crop',
    category: 'Fish',
    cookingTime: '30 mins',
    difficulty: 'Medium',
    servings: 4,
    slug: 'crispy-fish-tacos'
  }
];

export default function RecipesPage() {
  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Seafood Recipes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover delicious seafood recipes from quick weeknight meals to impressive dinner party dishes.
          </p>
        </div>

        <RecipeGrid recipes={recipes} />
      </div>
    </Container>
  );
}