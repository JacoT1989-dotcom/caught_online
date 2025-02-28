"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Play, Pause } from "lucide-react";
import { MediaPlayer, MediaPlayerRef } from "./media-player";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TestimonialCardProps {
  id: string;
  type: "video" | "audio";
  src: string;
  author: string;
  title: string;
  followers?: string;
  backgroundImage?: string;
}

export function TestimonialCard({
  id,
  type,
  src,
  author,
  title,
  followers,
  backgroundImage,
}: TestimonialCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  // Import the MediaPlayerRef from the same file to ensure type compatibility
  const mediaRef = useRef<MediaPlayerRef>(null);

  const handleClick = () => {
    if (isPlaying) {
      mediaRef.current?.pause();
    } else {
      mediaRef.current?.play();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#41c8d2] rounded-lg cursor-pointer"
    >
      <Card className="relative overflow-hidden">
        <div className="aspect-[9/16] relative">
          {type === "video" ? (
            <MediaPlayer
              ref={mediaRef}
              id={id}
              type="video"
              src={src}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              {backgroundImage && (
                <Image
                  src={backgroundImage}
                  alt={author}
                  className="absolute inset-0 w-full h-full object-cover"
                  width={640}
                  height={1138}
                />
              )}
              <MediaPlayer
                ref={mediaRef}
                id={id}
                type="audio"
                src={src}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Play/Pause Button */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm",
              "hover:bg-white/20 transition-colors",
              "border border-white/20",
              "flex items-center justify-center"
            )}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white ml-1" />
            )}
          </div>

          {/* Author Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white">{author}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-white/20 hover:bg-white/30"
                  >
                    {type === "audio" ? (
                      <Radio className="h-3 w-3" />
                    ) : (
                      <Users className="h-3 w-3" />
                    )}
                    {title}
                  </Badge>
                  {followers && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30"
                    >
                      {followers}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
