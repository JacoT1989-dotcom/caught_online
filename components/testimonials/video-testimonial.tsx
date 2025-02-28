'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface VideoTestimonialProps {
  src: string;
  author: string;
  title: string;
  followers: string;
}

export function VideoTestimonial({ src, author, title, followers }: VideoTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      {/* Video Container */}
      <div className={cn(
        "relative overflow-hidden rounded-lg",
        isMobile ? "aspect-[9/16]" : "aspect-[16/9]"
      )}>
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full",
            isMobile ? "object-cover" : "object-contain bg-black"
          )}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={src} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm",
            "hover:bg-white/20 transition-colors",
            "border border-white/20"
          )}
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="h-10 w-10 text-white" />
          ) : (
            <Play className="h-10 w-10 text-white ml-1" />
          )}
        </Button>

        {/* Author Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-white">{author}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-white/80">{title}</p>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {followers}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}