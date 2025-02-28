'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridControlsProps {
  title: string;
  prevEnabled: boolean;
  nextEnabled: boolean;
  onPrevClick: () => void;
  onNextClick: () => void;
}

export function ProductGridControls({
  title,
  prevEnabled,
  nextEnabled,
  onPrevClick,
  onNextClick,
}: ProductGridControlsProps) {
  return (
    <div className="flex items-center justify-between mb-6 px-4 md:px-0">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevClick}
          disabled={!prevEnabled}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextClick}
          disabled={!nextEnabled}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}