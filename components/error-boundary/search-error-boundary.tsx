'use client';

import { BaseErrorBoundary } from './base-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search } from 'lucide-react';

export function SearchErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <BaseErrorBoundary
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Failed to perform search. Please try again.</p>
            <Button 
              variant="outline" 
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              <Search className="mr-2 h-4 w-4" />
              Try searching again
            </Button>
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </BaseErrorBoundary>
  );
}