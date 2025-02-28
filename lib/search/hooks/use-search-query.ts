'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function useSearchQuery() {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleQueryChange = useDebounce((value: string) => {
    setQuery(value);
    setIsTyping(false);
  }, 300);

  const updateQuery = (value: string) => {
    setIsTyping(true);
    handleQueryChange(value);
  };

  return {
    query,
    isTyping,
    updateQuery,
    clearQuery: () => {
      setQuery('');
      setIsTyping(false);
    }
  };
}