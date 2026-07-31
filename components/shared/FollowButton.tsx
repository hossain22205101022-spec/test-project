"use client";

import { Plus } from "lucide-react";

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export default function FollowButton({
  isFollowing,
  onToggle,
  size = "sm",
}: FollowButtonProps) {
  if (size === "md") {
    return (
      <button
        onClick={onToggle}
        className={`rounded-lg text-xs font-medium tracking-wide uppercase px-5 py-2 transition-all duration-200 ${
          isFollowing
            ? "border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            : "bg-neutral-900 text-white hover:bg-neutral-800"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    );
  }

  // Small size: compact pill used in feed cards
  if (isFollowing) {
    return (
      <button
        onClick={onToggle}
        className="rounded-md border border-neutral-200 text-neutral-400 text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 transition-all duration-200 hover:border-neutral-300 hover:text-neutral-600"
      >
        Following
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-5 h-5 rounded-md bg-neutral-900 text-white transition-all duration-200 hover:bg-neutral-800"
      aria-label="Follow"
    >
      <Plus size={13} strokeWidth={2.5} />
    </button>
  );
}
