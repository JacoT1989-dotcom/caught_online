"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMediaPlayback } from "@/lib/hooks/use-media-playback";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MediaPlayerProps {
  id: string;
  type: "video" | "audio";
  src: string;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  className?: string;
}

export interface MediaPlayerRef {
  play: () => Promise<void> | undefined;
  pause: () => void;
}

export const MediaPlayer = forwardRef<MediaPlayerRef, MediaPlayerProps>(
  ({ id, type, src, onPlay, onPause, onEnded, className }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const { currentlyPlaying, setCurrentlyPlaying } = useMediaPlayback();

    useImperativeHandle(ref, () => ({
      play: () => {
        if (isLoading) return undefined;
        return mediaRef.current?.play();
      },
      pause: () => mediaRef.current?.pause(),
    }));

    // Force loading to complete after a timeout
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }, [src]);

    useEffect(() => {
      const media = mediaRef.current;
      if (!media) return;

      const handlePlay = () => {
        setCurrentlyPlaying(id);
        onPlay();
      };

      const handlePause = () => {
        onPause();
      };

      const handleEnded = () => {
        setCurrentlyPlaying(null);
        onEnded();
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
      };

      media.addEventListener("play", handlePlay);
      media.addEventListener("pause", handlePause);
      media.addEventListener("ended", handleEnded);
      media.addEventListener("canplay", handleCanPlay);
      media.addEventListener("loadstart", handleLoadStart);

      return () => {
        media.removeEventListener("play", handlePlay);
        media.removeEventListener("pause", handlePause);
        media.removeEventListener("ended", handleEnded);
        media.removeEventListener("canplay", handleCanPlay);
        media.removeEventListener("loadstart", handleLoadStart);
      };
    }, [id, onPlay, onPause, onEnded, setCurrentlyPlaying]);

    // Pause this media if another one starts playing
    useEffect(() => {
      const media = mediaRef.current;
      if (!media) return;
      if (currentlyPlaying && currentlyPlaying !== id && !media.paused) {
        media.pause();
      }
    }, [currentlyPlaying, id]);

    if (type === "video") {
      return (
        <>
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full z-10" />
          )}
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            className={cn(
              className,
              isLoading ? "opacity-0" : "opacity-100",
              "transition-opacity duration-300"
            )}
            playsInline
          >
            <source src={src} type="video/mp4" />
          </video>
        </>
      );
    }

    return (
      <>
        <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
      </>
    );
  }
);

MediaPlayer.displayName = "MediaPlayer";
