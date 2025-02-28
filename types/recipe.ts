export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  cookingTime: string;
  difficulty: string;
  servings: number;
  slug: string;
  ingredients?: string[];
  instructions?: string[];
  nutritionInfo?: {
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
  };
}
