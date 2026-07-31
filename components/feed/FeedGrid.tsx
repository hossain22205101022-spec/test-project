"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Post } from "@/types";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";

interface FeedGridProps {
  initialPosts: Post[];
  initialFollows: string[];
  initialSaves: string[];
}

export default function FeedGrid({
  initialPosts,
  initialFollows,
  initialSaves,
}: FeedGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [follows, setFollows] = useState<Set<string>>(
    new Set(initialFollows)
  );
  const [saves, setSaves] = useState<Set<string>>(new Set(initialSaves));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 12);
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0
      ? initialPosts[initialPosts.length - 1].created_at
      : null
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/posts?cursor=${encodeURIComponent(cursor)}&limit=12`
      );
      const data = await res.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        setHasMore(data.posts.length >= 12);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, cursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleFollowToggle = async (creatorId: string) => {
    const isFollowing = follows.has(creatorId);
    const action = isFollowing ? "unfollow" : "follow";

    // Optimistic update
    setFollows((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, action }),
      });

      if (!res.ok) {
        // Revert on error
        setFollows((prev) => {
          const next = new Set(prev);
          if (isFollowing) {
            next.add(creatorId);
          } else {
            next.delete(creatorId);
          }
          return next;
        });
      }
    } catch {
      // Revert on error
      setFollows((prev) => {
        const next = new Set(prev);
        if (isFollowing) {
          next.add(creatorId);
        } else {
          next.delete(creatorId);
        }
        return next;
      });
    }
  };

  const handleSaveToggle = async (postId: string) => {
    const isSaved = saves.has(postId);
    const action = isSaved ? "unsave" : "save";

    // Optimistic update
    setSaves((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action }),
      });

      if (!res.ok) {
        setSaves((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.add(postId);
          } else {
            next.delete(postId);
          }
          return next;
        });
      }
    } catch {
      setSaves((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isFollowing={post.creator ? follows.has(post.creator.id) : false}
            isSaved={saves.has(post.id)}
            onFollowToggle={() =>
              post.creator && handleFollowToggle(post.creator.id)
            }
            onSaveToggle={() => handleSaveToggle(post.id)}
          />
        ))}

        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-[11px] font-medium tracking-widest uppercase text-neutral-300 py-10">
          You&apos;ve reached the end of the feed
        </p>
      )}
    </div>
  );
}
