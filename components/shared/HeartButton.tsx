"use client";

import { Heart } from "lucide-react";

interface HeartButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  onAuthRequired?: () => void;
}

export default function HeartButton({
  isSaved,
  onToggle,
  onAuthRequired,
}: HeartButtonProps) {
  const handleClick = () => {
    if (onAuthRequired) {
      onAuthRequired();
      return;
    }
    onToggle();
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }}
      className="p-1.5 transition-transform"
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      <Heart
        size={20}
        className={`transition-all duration-200 ${
          isSaved
            ? "fill-cta text-cta animate-scale-pulse"
            : "fill-white/30 text-white drop-shadow-md hover:fill-white/50"
        }`}
      />
    </button>
  );
}
