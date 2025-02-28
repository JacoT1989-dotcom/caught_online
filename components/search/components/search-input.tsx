'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  query,
  onChange,
  onClear,
  inputRef,
  autoFocus,
  className
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "pl-10 pr-10 w-full h-12 text-lg",
          "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "border-muted bg-white",
          "placeholder:text-muted-foreground"
        )}
        autoFocus={autoFocus}
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          onClick={onClear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}