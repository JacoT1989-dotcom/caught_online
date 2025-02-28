'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { RegionSelector } from '@/components/region/region-selector';

export function MobileHeader() {
  const { items } = useCart();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-14 flex items-center justify-between border-b px-2">
      {/* Left Side - Location */}
      <div className="w-9">
        <RegionSelector>
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <MapPin className="h-5 w-5" />
          </Button>
        </RegionSelector>
      </div>

      {/* Center - Logo */}
      <Link 
        href="/" 
        className="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg md:text-xl font-bold text-[#f6424a] whitespace-nowrap"
      >
        Caught Online<sup className="text-[0.6em] font-normal">®</sup>
      </Link>

      {/* Right Side - Cart */}
      <div className="w-9">
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 relative"
          asChild
        >
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#f6424a] text-xs font-bold text-white flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
}