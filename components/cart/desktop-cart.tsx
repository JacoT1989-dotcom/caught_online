'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContent } from './cart-content';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface DesktopCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesktopCart({ open, onOpenChange }: DesktopCartProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - Positioned below the header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-20 z-40 bg-black/20"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Cart */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed right-8 top-20 z-40 w-[400px] rounded-xl border bg-background shadow-lg overflow-hidden"
            style={{ 
              height: 'calc(100vh - 144px)',
              maxHeight: 'calc(100vh - 144px)' 
            }}
          >
            <div className="flex flex-col h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
                <VisuallyHidden>Close cart</VisuallyHidden>
              </Button>
              <CartContent onClose={() => onOpenChange(false)} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}