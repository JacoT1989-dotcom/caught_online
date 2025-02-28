'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function MediaControls({ isPlaying, onPlayPause }: MediaControlsProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm",
        "hover:bg-white/20 transition-colors",
        "border border-white/20"
      )}
      onClick={onPlayPause}
    >
      {isPlaying ? (
        <Pause className="h-10 w-10 text-white" />
      ) : (
        <Play className="h-10 w-10 text-white ml-1" />
      )}
    </Button>
  );
}