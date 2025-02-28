'use client';

import { BaseErrorBoundary } from './base-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShoppingCart } from 'lucide-react';

export function CartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <BaseErrorBoundary
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cart Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>There was a problem with your cart. Please try again.</p>
            <Button 
              variant="outline" 
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Reload cart
            </Button>
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </BaseErrorBoundary>
  );
}