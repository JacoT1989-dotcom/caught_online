'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CartQuantityProps {
  productId: string;
  className?: string;
  showToast?: boolean;
}

export function CartQuantity({ productId, className, showToast = false }: CartQuantityProps) {
  const { items, updateQuantity, removeItem } = useCart();
  const cartItem = items.find(item => item.id === productId);

  if (!cartItem) return null;

  const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
      if (showToast) {
        if (newQuantity > cartItem.quantity) {
          toast.success(`${cartItem.title} added to cart`, {
            duration: 2000
          });
        } else {
          toast.success(`${cartItem.title} removed from cart`, {
            duration: 2000
          });
        }
      }
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2 w-full h-10 bg-accent/50 rounded-md",
        className
      )}
      onClick={(e) => e.preventDefault()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-accent"
        onClick={(e) => handleQuantityChange(e, Math.max(0, cartItem.quantity - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">
        {cartItem.quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-accent"
        onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}