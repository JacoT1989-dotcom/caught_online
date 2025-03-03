'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CartContent } from '@/components/cart/cart-content';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Not Fixed */}
      <div className="bg-background">
        {/* Cart Title */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex-1" /> {/* Spacer for centering */}
          <h1 className="font-semibold text-lg">Shopping Cart</h1>
          <div className="flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-transparent"
              onClick={() => router.back()}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Not Fixed */}
      <div className="bg-background">
        <CartContent onClose={() => router.back()} />
      </div>
    </div>
  );
}