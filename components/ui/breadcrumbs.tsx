'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      className={cn(
        "flex flex-wrap items-center gap-1.5 py-3",
        "text-sm md:text-base",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-9 px-3 text-muted-foreground hover:text-foreground",
          "min-w-[44px] md:min-w-0", // Ensure minimum touch target size
          "rounded-lg" // More prominent button shape
        )}
        asChild
      >
        <Link href="/">Home</Link>
      </Button>

      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
          {item.href && index < items.length - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 px-3 text-muted-foreground hover:text-foreground",
                "min-w-[44px] md:min-w-0", // Ensure minimum touch target size
                "rounded-lg" // More prominent button shape
              )}
              asChild
            >
              <Link href={item.href}>
                {item.label}
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 px-3 text-foreground cursor-default hover:bg-transparent",
                "min-w-[44px] md:min-w-0", // Ensure minimum touch target size
                "rounded-lg" // More prominent button shape
              )}
              disabled
            >
              <span className="truncate max-w-[150px] md:max-w-[200px]">
                {item.label}
              </span>
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}