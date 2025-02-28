import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RecipeContent } from "@/components/recipes/recipe-content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

// Recipe data - in a real app this would come from an API/CMS
const recipes = {
  "grilled-salmon-lemon-butter": {
    slug: "grilled-salmon-lemon-butter",
    title: "Grilled Salmon with Lemon Butter",
    description:
      "A delicious and healthy grilled salmon recipe with a zesty lemon butter sauce.",
    image:
      "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=2824&auto=format&fit=crop",
    category: "Fish",
    cookingTime: "25 mins",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      "4 salmon fillets",
      "2 lemons",
      "4 tbsp butter",
      "2 cloves garlic, minced",
      "Salt and pepper to taste",
      "Fresh parsley",
    ],
    instructions: [
      "Preheat your grill to medium-high heat.",
      "Season salmon fillets with salt and pepper.",
      "Melt butter and add minced garlic.",
      "Grill salmon for 4-5 minutes per side.",
      "Drizzle with lemon butter sauce.",
      "Garnish with parsley and serve.",
    ],
    nutritionInfo: {
      calories: 350,
      protein: "34g",
      fat: "22g",
      carbs: "0g",
    },
  },
  "garlic-butter-prawns": {
    slug: "garlic-butter-prawns",
    title: "Garlic Butter Prawns",
    description:
      "Quick and easy garlic butter prawns that are perfect for a weeknight dinner.",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2924&auto=format&fit=crop",
    category: "Shellfish",
    cookingTime: "15 mins",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      "500g prawns, peeled and deveined",
      "4 cloves garlic, minced",
      "60g butter",
      "1 lemon",
      "Fresh parsley",
      "Salt and pepper",
    ],
    instructions: [
      "Melt butter in a large pan over medium heat.",
      "Add minced garlic and sauté until fragrant.",
      "Add prawns and cook for 2-3 minutes per side.",
      "Season with salt and pepper.",
      "Squeeze lemon juice over prawns.",
      "Garnish with parsley and serve.",
    ],
    nutritionInfo: {
      calories: 280,
      protein: "28g",
      fat: "18g",
      carbs: "2g",
    },
  },
  "seafood-paella": {
    slug: "seafood-paella",
    title: "Seafood Paella",
    description:
      "A classic Spanish seafood paella loaded with fresh fish, prawns, and mussels.",
    image:
      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=2940&auto=format&fit=crop",
    category: "Mixed Seafood",
    cookingTime: "45 mins",
    difficulty: "Medium",
    servings: 6,
    ingredients: [
      "2 cups paella rice",
      "Mixed seafood (prawns, mussels, fish)",
      "Saffron threads",
      "Onion and garlic",
      "Bell peppers",
      "Fish stock",
    ],
    instructions: [
      "Sauté onions and garlic in olive oil.",
      "Add rice and saffron, stir to coat.",
      "Pour in hot fish stock.",
      "Add seafood in stages.",
      "Let cook without stirring until rice is done.",
      "Let rest before serving.",
    ],
    nutritionInfo: {
      calories: 450,
      protein: "32g",
      fat: "12g",
      carbs: "58g",
    },
  },
  "crispy-fish-tacos": {
    slug: "crispy-fish-tacos",
    title: "Crispy Fish Tacos",
    description: "Battered fish tacos with fresh slaw and chipotle mayo.",
    image:
      "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?q=80&w=2940&auto=format&fit=crop",
    category: "Fish",
    cookingTime: "30 mins",
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      "White fish fillets",
      "Flour and beer for batter",
      "Cabbage slaw",
      "Corn tortillas",
      "Chipotle mayo",
      "Lime wedges",
    ],
    instructions: [
      "Make beer batter and coat fish.",
      "Fry until golden and crispy.",
      "Warm tortillas.",
      "Assemble with slaw and sauce.",
      "Serve with lime wedges.",
      "Enjoy immediately while hot.",
    ],
    nutritionInfo: {
      calories: 380,
      protein: "24g",
      fat: "16g",
      carbs: "42g",
    },
  },
}; // Removed 'as const' assertion

export default function RecipePage({ params }: RecipePageProps) {
  const recipe = recipes[params.slug as keyof typeof recipes];

  if (!recipe) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Recipes", href: "/recipes" },
    { label: recipe.title },
  ];

  return (
    <Container>
      <div className="py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <RecipeContent recipe={recipe} />
      </div>
    </Container>
  );
}
