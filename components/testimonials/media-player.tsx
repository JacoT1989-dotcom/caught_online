'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMediaPlayback } from '@/lib/hooks/use-media-playback';

interface MediaPlayerProps {
  id: string;
  type: 'video' | 'audio';
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

export const MediaPlayer = forwardRef<MediaPlayerRef, MediaPlayerProps>(({
  id,
  type,
  src,
  onPlay,
  onPause,
  onEnded,
  className
}, ref) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const { currentlyPlaying, setCurrentlyPlaying } = useMediaPlayback();

  useImperativeHandle(ref, () => ({
    play: () => mediaRef.current?.play(),
    pause: () => mediaRef.current?.pause()
  }));

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

    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
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

  if (type === 'video') {
    return (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        className={className}
        playsInline
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <audio
      ref={mediaRef as React.RefObject<HTMLAudioElement>}
      src={src}
    />
  );
});

MediaPlayer.displayName = 'MediaPlayer';