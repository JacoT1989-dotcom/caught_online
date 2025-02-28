'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Paths where footer padding should be hidden
const HIDE_FOOTER_PADDING_PATHS = [
  '/login', 
  '/register', 
  '/search', 
  '/categories', 
  '/cart',
  '/products',
  '/about',
  '/contact',
  '/delivery',
  '/how-it-works',
  '/privacy',
  '/subscription',
  '/sustainability',
  '/terms',
  '/why-frozen'
];

export function FooterPadding() {
  const pathname = usePathname();
  const shouldHidePadding = HIDE_FOOTER_PADDING_PATHS.includes(pathname) || 
                           pathname.startsWith('/products/');

  return (
    <div 
      className={cn(
        "hidden md:block h-16", // Only show on desktop
        shouldHidePadding && "md:hidden" // Hide on specific pages
      )} 
    />
  );
}