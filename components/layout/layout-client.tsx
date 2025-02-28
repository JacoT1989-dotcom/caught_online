'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FooterPadding } from './footer-padding';

interface LayoutClientProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function LayoutClient({ children, footer }: LayoutClientProps) {
  const pathname = usePathname();
  
  // Add all paths where footer should be hidden
  const hideFooter = [
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
  ].includes(pathname) || pathname.startsWith('/products/');
  
  return (
    <div className="relative min-h-screen">
      <div className={cn(hideFooter && "pb-16 md:pb-0")}>
        {children}
      </div>
      <FooterPadding />
      <div className={cn(
        "hidden md:block", // Always hide on mobile
        hideFooter && "md:block" // Show on desktop for pages that hide mobile footer
      )}>
        {footer}
      </div>
    </div>
  );
}