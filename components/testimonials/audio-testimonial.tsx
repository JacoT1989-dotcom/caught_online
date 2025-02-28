"use client";

import { useState, useRef } from "react";
import { Play, Pause, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image"; // Add this import

interface AudioTestimonialProps {
  src: string;
  author: string;
  title: string;
  quote: string;
  image?: string;
}

export function AudioTestimonial({
  src,
  author,
  title,
  quote,
  image,
}: AudioTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative h-full">
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={author}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
        </div>
      )}

      <div className="relative p-6 flex flex-col h-full">
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full",
              "bg-[#41c8d2] hover:bg-[#41c8d2]/90",
              "text-white border-2 border-white/20"
            )}
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          <div>
            <h3 className={cn("font-semibold text-lg", image && "text-white")}>
              {author}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={image ? "default" : "secondary"}
                className={cn(
                  "gap-1",
                  image && "bg-white/20 hover:bg-white/30"
                )}
              >
                <Radio className="h-3 w-3" />
                {title}
              </Badge>
            </div>
          </div>
        </div>

        <blockquote
          className={cn(
            "flex-1 italic relative",
            image ? "text-white/90" : "text-muted-foreground"
          )}
        >
          <span className="text-4xl text-white/20 absolute -top-4 -left-2">
            &ldquo;
          </span>
          {quote}
          <span className="text-4xl text-white/20 absolute -bottom-8 -right-2">
            &ldquo;
          </span>
        </blockquote>
      </div>
    </div>
  );
}
