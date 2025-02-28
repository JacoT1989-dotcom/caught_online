"use client";

import { useEffect, useRef } from "react";
import { useVideos } from "@/lib/hooks/use-videos";
import { cn } from "@/lib/utils";
import { VIDEO_URLS } from "@/lib/constants/videos";

interface VideoPlayerProps {
  category: keyof typeof VIDEO_URLS;
  videoKey: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

export function VideoPlayer({
  category,
  videoKey,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { getVideoUrl, setCurrentVideo } = useVideos();
  const videoUrl = getVideoUrl(category, videoKey);

  useEffect(() => {
    if (videoUrl) {
      setCurrentVideo(videoUrl);
    }
  }, [videoUrl, setCurrentVideo]);

  return (
    <video
      ref={videoRef}
      className={cn("w-full h-full object-cover", className)}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}
