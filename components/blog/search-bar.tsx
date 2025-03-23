'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  initialQuery?: string;
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialQuery);
  
  // Update local state when initialQuery changes
  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchValue.trim()) {
      // Create new URLSearchParams instance
      const params = new URLSearchParams(searchParams.toString());
      
      // Update or add search query
      params.set('q', searchValue);
      
      // Reset to page 1 when searching
      params.set('page', '1');
      
      // Navigate to search results
      router.push(`/blog?${params.toString()}`);
    } else {
      // If search is empty, remove the q parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      
      // Keep the current page if it exists
      const page = params.get('page');
      if (!page) {
        params.set('page', '1');
      }
      
      // Navigate without search query
      router.push(`/blog?${params.toString()}`);
    }
  };
  
  const handleClear = () => {
    setSearchValue('');
    
    // Remove search query but keep pagination
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    
    // Keep the current page if it exists
    const page = params.get('page');
    if (!page) {
      params.set('page', '1');
    }
    
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        <Input
          type="text"
          placeholder="Search blog posts..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-24" // Increased right padding to accommodate both buttons
        />
        
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-20 p-0 h-8 w-8"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 h-7 px-4"
        >
          Search
        </Button>
      </div>
    </form>
  );
}