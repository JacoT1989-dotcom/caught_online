'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collections } from '@/lib/collections';

interface CategoryButtonsProps {
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
  className?: string;
}

export function CategoryButtons({ onCategoryClick, activeCategory, className }: CategoryButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={!activeCategory ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => onCategoryClick?.('all')}
        asChild={!onCategoryClick}
      >
        {onCategoryClick ? (
          <span>All Products</span>
        ) : (
          <Link href="/products">All Products</Link>
        )}
      </Button>

      {collections.map((collection) => (
        <Button
          key={collection.handle}
          variant={activeCategory === collection.handle ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => onCategoryClick?.(collection.handle)}
          asChild={!onCategoryClick}
        >
          {onCategoryClick ? (
            <span>{collection.title}</span>
          ) : (
            <Link href={`/products?collection=${collection.handle}`}>
              {collection.title}
            </Link>
          )}
        </Button>
      ))}
    </div>
  );
}