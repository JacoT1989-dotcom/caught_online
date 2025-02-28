'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { collections, getCollectionByHandle } from '@/lib/collections';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CollectionHeaderProps {
  collection?: string;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  const currentCollection = collection ? getCollectionByHandle(collection) : undefined;
  
  // Find parent collection if this is a subcollection
  const parentCollection = collections.find(col => 
    col.subcollections?.some(sub => sub.handle === collection)
  );

  // Determine which collection to show subcategories for
  const collectionWithSubs = parentCollection || currentCollection;
  const isMainCategory = collections.some(col => col.handle === collection);
  const isSubcategory = !isMainCategory && collection;
  
  return (
    <div className="space-y-4 mb-4 mt-3">
      {/* Breadcrumbs - Always visible */}
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Link href="/products" className="hover:text-[#f6424a]">
          All Products
        </Link>
        {currentCollection && (
          <>
            <ChevronRight className="h-4 w-4" />
            {parentCollection && (
              <>
                <Link 
                  href={`/products?collection=${parentCollection.handle}`}
                  className="hover:text-[#f6424a]"
                >
                  {parentCollection.title}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="font-medium">
              {currentCollection.title}
            </span>
          </>
        )}
      </div>

      {/* Category Buttons - Hidden on mobile */}
      <div className="hidden md:flex flex-wrap gap-2">
        {/* Always show All Products button */}
        <Button
          variant={!collection ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          asChild
        >
          <Link href="/products">
            All Products
          </Link>
        </Button>
        
        {/* Show main categories */}
        {collections.map((col) => (
          <Button
            key={col.handle}
            variant={col.handle === collection ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            asChild
          >
            <Link href={`/products?collection=${col.handle}`}>
              {col.title}
            </Link>
          </Button>
        ))}

        {/* Show subcategories when in a main category or subcategory */}
        {collectionWithSubs?.subcollections?.map((sub) => (
          <Button
            key={sub.handle}
            variant={sub.handle === collection ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            asChild
          >
            <Link href={`/products?collection=${sub.handle}`}>
              {sub.title}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}