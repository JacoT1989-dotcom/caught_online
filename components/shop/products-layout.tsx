'use client';

import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { ShopNav } from './shop-nav';

interface ProductsLayoutProps {
  children: React.ReactNode;
}

export function ProductsLayout({ children }: ProductsLayoutProps) {
  const { isVisible } = useScroll(50);

  return (
    <div className="min-h-screen bg-background">
      {/* Shop Nav */}
      <div className={cn(
        "sticky z-40 transition-all duration-300 transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
        "top-[calc(var(--header-height,56px)+var(--banner-height,28px)+1rem)]", // 1rem for mobile
        "md:top-[calc(var(--header-height,56px)+var(--banner-height,28px)+2rem)]" // 2rem for desktop
      )}>
        <div className="border-t border-b bg-background">
          <div className="px-2 md:px-8 py-4">
            <div className="max-w-[1440px] mx-auto">
              <ShopNav />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-16 md:pb-32"> {/* Added padding bottom for footer margin */}
        {children}
      </div>
    </div>
  );
}