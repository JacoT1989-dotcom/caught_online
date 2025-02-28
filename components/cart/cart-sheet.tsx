'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContent } from './cart-content';
import { CartErrorBoundary } from '@/components/error-boundary/cart-error-boundary';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <CartErrorBoundary>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent 
            side="right" 
            className={cn(
              "w-full p-0 border-0 shadow-none",
              "fixed inset-x-0 top-[calc(var(--header-height)+var(--banner-height))]",
              "h-[calc(100vh-var(--header-height)-var(--banner-height)-4rem)]",
              "bg-background"
            )}
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="flex-shrink-0 px-4 py-3 border-b">
                <SheetTitle className="text-base font-medium">Shopping Cart</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto">
                <CartContent onClose={() => onOpenChange(false)} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => onOpenChange(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "fixed z-40 w-[400px] rounded-xl border bg-background shadow-lg overflow-hidden",
                  "right-8 top-[calc(var(--header-height)+var(--banner-height)+1rem)]",
                  "h-[calc(100vh-var(--header-height)-var(--banner-height)-2rem)]"
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="relative flex items-center justify-center px-6 py-4 border-b">
                    <h2 className="font-semibold text-lg">Shopping Cart</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                      onClick={() => onOpenChange(false)}
                    >
                      <X className="h-4 w-4" />
                      <VisuallyHidden>Close cart</VisuallyHidden>
                    </Button>
                  </div>
                  <CartContent onClose={() => onOpenChange(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </CartErrorBoundary>
  );
}