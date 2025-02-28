'use client';

import { BaseErrorBoundary } from './base-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, PackageSearch } from 'lucide-react';
import Link from 'next/link';

export function ProductErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <BaseErrorBoundary
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Product Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Failed to load product information. Please try again.</p>
            <Button 
              variant="outline" 
              className="w-fit"
              asChild
            >
              <Link href="/products">
                <PackageSearch className="mr-2 h-4 w-4" />
                Browse all products
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </BaseErrorBoundary>
  );
}