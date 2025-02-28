"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: {
    title: string;
    description: string;
    image: string;
    category: string;
    cookingTime: string;
    difficulty: string;
    servings: number;
    slug: string;
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.slug}`}>
      <Card className="overflow-hidden h-full hover:border-primary transition-colors">
        <div className="aspect-[16/9] relative">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-[#f6424a] hover:bg-[#f6424a]/90">
              {recipe.category}
            </Badge>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.cookingTime}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Serves {recipe.servings}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
