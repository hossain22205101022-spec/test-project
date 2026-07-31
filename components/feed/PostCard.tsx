"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Post } from "@/types";
import Avatar from "@/components/shared/Avatar";
import FollowButton from "@/components/shared/FollowButton";
import HeartButton from "@/components/shared/HeartButton";

interface PostCardProps {
  post: Post;
  isFollowing: boolean;
  isSaved: boolean;
  onFollowToggle: () => void;
  onSaveToggle: () => void;
}

export default function PostCard({
  post,
  isFollowing,
  isSaved,
  onFollowToggle,
  onSaveToggle,
}: PostCardProps) {
  const creator = post.creator;
  const creatorUsername = creator?.username || "unknown";
  const postUrl = `/feed/${creatorUsername}/posts/${post.slug}`;

  return (
    <div className="flex flex-col">
      {/* Creator Row - outside the card */}
      {creator && (
        <div className="flex items-center gap-2 py-2 px-0.5">
          <Link href={`/explore/${creator.username}`} className="shrink-0">
            <Avatar
              src={creator.avatar_url}
              alt={creator.display_name}
              size={28}
            />
          </Link>
          <Link
            href={`/explore/${creator.username}`}
            className="text-[13px] font-medium text-neutral-900 hover:text-accent transition-colors truncate min-w-0"
          >
            {creator.display_name}
          </Link>
          <div className="ml-auto shrink-0">
            <FollowButton isFollowing={isFollowing} onToggle={onFollowToggle} />
          </div>
        </div>
      )}

      {/* Post Media Card */}
      <Link
        href={postUrl}
        className="block relative aspect-[9/16] rounded-card overflow-hidden bg-neutral-100"
      >
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.description || "Post image"}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        ) : post.video_url ? (
          <video
            src={post.video_url}
            muted
            playsInline
            loop
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Play size={32} className="text-gray-300" />
          </div>
        )}

        {/* Video play overlay — only when showing image thumbnail for a video post */}
        {post.video_url && post.image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play size={22} className="text-neutral-900 ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Heart button */}
        <div className="absolute bottom-2.5 right-2.5">
          <HeartButton isSaved={isSaved} onToggle={onSaveToggle} />
        </div>
      </Link>
    </div>
  );
}
