"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, RefObject } from "react"; // Added RefObject

interface SearchInputProps {
  defaultValue?: string;
  query?: string; // Add query as an optional prop
  onChange?: (value: string) => void; // Add onChange as an optional prop
  onSearch: (value: string) => void;
  onClear?: () => void; // Add onClear as an optional prop
  placeholder?: string;
  className?: string;
  inputRef?: RefObject<HTMLInputElement>; // Add inputRef prop
  autoFocus?: boolean; // Add autoFocus prop
}

export function SearchInput({
  defaultValue = "",
  query, // Handle query prop
  onChange, // Handle onChange prop
  onSearch,
  onClear, // Handle onClear prop
  placeholder = "Search products...",
  className,
  inputRef, // Handle inputRef prop
  autoFocus, // Handle autoFocus prop
}: SearchInputProps) {
  // Use query if provided, otherwise use defaultValue
  const [value, setValue] = useState(query || defaultValue);

  useEffect(() => {
    if (query !== undefined) {
      setValue(query);
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
    onClear?.(); // Call onClear if provided
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue); // Call onChange if provided
    onSearch(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef} // Use inputRef if provided
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus} // Use autoFocus prop
        className={cn(
          "pl-10 pr-10 w-full h-12 text-lg",
          "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "border-muted bg-white",
          "placeholder:text-muted-foreground"
        )}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </form>
  );
}
