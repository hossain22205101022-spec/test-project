"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Post } from "@/types";
import { Heart, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/shared/Avatar";

export default function ReelsFeed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length > 0);
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].created_at : null
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return;
    
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/reels?cursor=${cursor}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        const newPosts: Post[] = data.posts || [];
        const nextCursor: string | null = data.nextCursor || null;
        if (newPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNew = newPosts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        }
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, hasMore]);

  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      loadMore();
    }
  };

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 w-full max-w-md mx-auto snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scrollbar-hide flex flex-col"
    >
      {posts.map((post) => (
        <div key={post.id} className="w-full h-full shrink-0 flex items-center justify-center pt-safe-top">
          <ReelItem post={post} />
        </div>
      ))}
      {isLoadingMore && <div className="text-center text-foreground py-4 shrink-0">Loading...</div>}
      {!hasMore && posts.length > 0 && <div className="text-center text-foreground/50 py-4 pb-8 shrink-0">No more reels</div>}
    </div>
  );
}

function ReelItem({ post }: { post: Post }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersecting) {
      videoRef.current?.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isIntersecting]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full md:h-[calc(100%-1rem)] snap-center snap-always bg-bg flex items-center justify-center md:mb-4 last:mb-0 md:rounded-2xl overflow-hidden cursor-pointer"
      onClick={togglePlay}
    >
      {post.video_url ? (
        <video
          ref={videoRef}
          src={post.video_url}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
        />
      ) : post.image_url ? (
        <Image
          src={post.image_url}
          alt={post.description || "Post image"}
          fill
          className="object-cover"
        />
      ) : null}

      {/* Play Icon Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:bg-black/60"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Overlay controls - like Amazon FBA / FB Reels */}
      <div className="absolute inset-x-0 bottom-0 top-[50%] pointer-events-none bg-gradient-to-b from-transparent via-bg/20 to-bg/80" />

      {/* Right side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 pointer-events-auto">
        <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <Heart className="w-6 h-6 text-foreground" />
          </div>
          <span className="text-foreground text-xs font-semibold drop-shadow-md">
            {post.engagement.likes || 0}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <MessageCircle className="w-6 h-6 text-foreground" />
          </div>
          <span className="text-foreground text-xs font-semibold drop-shadow-md">
            {post.engagement.comments || 0}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <Share2 className="w-6 h-6 text-foreground" />
          </div>
          <span className="text-foreground text-xs font-semibold drop-shadow-md">
            Share
          </span>
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute left-4 bottom-4 right-16 pointer-events-auto">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/explore/${post.creator?.username}`} onClick={(e) => e.stopPropagation()} className="rounded-full border-2 border-foreground overflow-hidden shadow-sm shrink-0">
            <Avatar
              src={post.creator?.avatar_url || ""}
              alt={post.creator?.username || "creator"}
              size={40}
            />
          </Link>
          <div className="flex flex-col">
            <Link
              href={`/explore/${post.creator?.username}`}
              className="text-foreground font-bold text-sm drop-shadow-md hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{post.creator?.username}
            </Link>
          </div>
          <button className="ml-2 px-3 py-1 bg-transparent border border-foreground text-foreground rounded-full text-xs font-semibold hover:bg-black/5 transition-colors" onClick={(e) => e.stopPropagation()}>
            Follow
          </button>
        </div>

        <p className="text-foreground text-sm line-clamp-2 drop-shadow-md mb-3">
          {post.description}
        </p>

        {/* Amazon Products Carousel inside Reel */}
        {post.products && post.products.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" onPointerDown={(e) => e.stopPropagation()}>
            {post.products.map((product) => (
              <a
                key={product.id}
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white/90 backdrop-blur-md p-1.5 rounded-lg flex items-center gap-2 max-w-[160px] hover:bg-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-8 h-8 rounded-md bg-white border border-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={product.image_url || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-gray-900 truncate">
                    {product.name}
                  </span>
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                    <ShoppingBag className="w-3 h-3" /> Amazon
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
