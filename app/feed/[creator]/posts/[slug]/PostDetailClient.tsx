"use client";

import { useState } from "react";
import type { Post } from "@/types";
import CreatorProfileStrip from "@/components/post-detail/CreatorProfileStrip";
import PostMedia from "@/components/post-detail/PostMedia";
import PostCaption from "@/components/post-detail/PostCaption";
import ShopProductCards from "@/components/post-detail/ShopProductCards";
import TrendingPostsStrip from "@/components/post-detail/TrendingPostsStrip";
import MorePostsGrid from "@/components/post-detail/MorePostsGrid";
import HeartButton from "@/components/shared/HeartButton";

interface PostDetailClientProps {
  post: Post;
  morePosts: Post[];
  trendingPosts: Post[];
  isFollowing: boolean;
  isSaved: boolean;
  postUrl: string;
}

export default function PostDetailClient({
  post,
  morePosts,
  trendingPosts,
  isFollowing: initialFollowing,
  isSaved: initialSaved,
  postUrl,
}: PostDetailClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleFollowToggle = async () => {
    const action = isFollowing ? "unfollow" : "follow";
    setIsFollowing(!isFollowing);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: post.creator_id, action }),
      });

      if (!res.ok) {
        setIsFollowing(isFollowing); // Revert
      }
    } catch {
      setIsFollowing(isFollowing); // Revert
    }
  };

  const handleSaveToggle = async () => {
    const action = isSaved ? "unsave" : "save";
    setIsSaved(!isSaved);

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, action }),
      });

      if (!res.ok) {
        setIsSaved(isSaved); // Revert
      }
    } catch {
      setIsSaved(isSaved); // Revert
    }
  };

  const hasProducts = post.products && post.products.length > 0;

  return (
    <article className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-5 sm:py-8">

      {/* ── Two-column layout: sticky media left, meta right ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">

        {/* LEFT: 9:16 media — constrained on mobile, sticky on desktop */}
        <div className="w-full sm:max-w-sm mx-auto lg:mx-0 lg:w-[340px] xl:w-[400px] shrink-0 lg:sticky lg:top-[72px]">
          <PostMedia
            imageUrl={post.image_url}
            videoUrl={post.video_url}
            alt={post.description}
          />
        </div>

        {/* RIGHT: Creator + caption + likes + products */}
        <div className="flex-1 min-w-0 mt-5 lg:mt-0">

          {/* Creator Row */}
          {post.creator && (
            <CreatorProfileStrip
              creator={post.creator}
              isFollowing={isFollowing}
              onFollowToggle={handleFollowToggle}
              postUrl={postUrl}
            />
          )}

          {/* Caption & Hashtags */}
          <div className="mt-4">
            <PostCaption description={post.description} hashtags={post.hashtags} />
          </div>

          {/* Likes */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-neutral-100">
            <HeartButton isSaved={isSaved} onToggle={handleSaveToggle} />
            <span className="text-[13px] font-medium text-neutral-500">
              {post.engagement?.likes || 0} likes
            </span>
          </div>

          {/* Products */}
          {hasProducts && (
            <div className="mt-6">
              <ShopProductCards products={post.products!} />
            </div>
          )}

        </div>
      </div>

      {/* ── Trending Posts ── */}
      <div className="mt-12 pt-8 border-t border-neutral-100">
        <TrendingPostsStrip posts={trendingPosts} />
      </div>

      {/* ── More from Creator ── */}
      {post.creator && (
        <div className="mt-10">
          <MorePostsGrid
            posts={morePosts}
            creatorDisplayName={post.creator.display_name}
          />
        </div>
      )}

    </article>
  );
}
