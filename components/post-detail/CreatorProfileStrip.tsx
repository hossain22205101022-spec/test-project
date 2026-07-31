"use client";

import Link from "next/link";
import Avatar from "@/components/shared/Avatar";
import FollowButton from "@/components/shared/FollowButton";
import type { Creator } from "@/types";

interface CreatorProfileStripProps {
  creator: Creator;
  isFollowing: boolean;
  onFollowToggle: () => void;
  postUrl: string;
}

export default function CreatorProfileStrip({
  creator,
  isFollowing,
  onFollowToggle,
}: CreatorProfileStripProps) {
  return (
    <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
      <Link href={`/explore/${creator.username}`} className="shrink-0">
        <Avatar src={creator.avatar_url} alt={creator.display_name} size={40} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/explore/${creator.username}`}
          className="text-[13px] font-semibold text-neutral-900 hover:text-accent transition-colors block truncate"
        >
          {creator.display_name}
        </Link>
        <p className="text-[11px] text-neutral-400 tracking-wide">@{creator.username}</p>
      </div>
      <FollowButton
        isFollowing={isFollowing}
        onToggle={onFollowToggle}
        size="md"
      />
    </div>
  );
}
