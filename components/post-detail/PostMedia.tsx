"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2 } from "lucide-react";

interface PostMediaProps {
  imageUrl: string | null;
  videoUrl: string | null;
  alt: string;
}

export default function PostMedia({ imageUrl, videoUrl, alt }: PostMediaProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handlePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) {
      setProgress((currentTime / duration) * 100);
      const remaining = duration - currentTime;
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      setTimeLeft(`-${mins}:${secs.toString().padStart(2, "0")}`);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  if (videoUrl) {
    return (
      <div className="relative rounded-card overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={imageUrl || undefined}
          autoPlay
          muted
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          className="w-full aspect-[9/16] object-cover"
        />

        {/* Heart overlay */}
        <div className="absolute bottom-16 right-3 z-10">
          <button className="p-1.5" aria-label="Save post">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Video Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-8 pb-3 px-3">
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-white/30 rounded-full mb-2.5 cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1 text-white hover:text-white/80 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} fill="white" />
              ) : (
                <Play size={18} fill="white" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-1 text-white hover:text-white/80 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            {timeLeft && (
              <span className="text-white text-xs font-medium tabular-nums">
                {timeLeft}
              </span>
            )}

            <div className="flex-1" />

            <button
              onClick={handlePiP}
              className="p-1 text-white hover:text-white/80 transition-colors"
              aria-label="Picture in Picture"
            >
              <PictureInPicture2 size={18} />
            </button>

            <button
              onClick={handleFullscreen}
              className="p-1 text-white hover:text-white/80 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="relative w-full aspect-[9/16] rounded-card overflow-hidden bg-gray-100 flex items-center justify-center">
        <span className="text-gray-300 text-sm">No media</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[9/16] rounded-card overflow-hidden bg-neutral-100">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover"
        priority
      />
    </div>
  );
}
