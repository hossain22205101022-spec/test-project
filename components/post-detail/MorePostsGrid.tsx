"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { useRef, useState } from "react";
import type { Post, Product } from "@/types";

/* ── Per-card sub-component ── */
function PostCard({ post }: { post: Post }) {
  const [videoError, setVideoError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const username  = post.creator?.username || "unknown";
  const products  = post.products ?? [];
  const visible   = products.slice(0, 3);
  const overflow  = products.length - visible.length;
  const isVideo   = !!post.video_url && !videoError;

  /* On hover: swap image → video and play */
  const handleMouseEnter = () => {
    setHovered(true);
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  /* What to show in the thumbnail area */
  const showImage = !!post.image_url && (!hovered || !isVideo);
  const showVideo = isVideo && (hovered || !post.image_url);

  return (
    <div
      className="group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Card shell — minimal radius + feather shadow ── */}
      <div className="rounded-card overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">

        {/* ── Media area (9:16) ── */}
        <Link href={`/feed/${username}/posts/${post.slug}`} className="block">
          <div className="relative aspect-[9/16] bg-neutral-100 overflow-hidden">

            {/* Static image (default / non-hover) */}
            {post.image_url && (
              <Image
                src={post.image_url}
                alt={post.description || "Post"}
                fill
                sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 ${
                  showImage ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            )}

            {/* Video element — always mounted when video exists, visible only on hover */}
            {isVideo && (
              <video
                ref={videoRef}
                src={post.video_url!}
                muted
                playsInline
                loop
                preload="metadata"
                onError={() => setVideoError(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  showVideo ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Fallback — broken or no media */}
            {!post.image_url && !isVideo && (
              <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                <Play size={22} className="text-neutral-400" />
              </div>
            )}

            {/* ── Play badge — always visible on video posts, fades on hover ── */}
            {isVideo && (
              <div
                className={`absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
                  hovered ? "opacity-0" : "opacity-100"
                }`}
              >
                <Play size={8} className="text-white fill-white" />
                <span className="text-white text-[9px] font-semibold tracking-wide uppercase leading-none">
                  Video
                </span>
              </div>
            )}

            {/* Heart — bottom-right */}
            <div className="absolute bottom-2.5 right-2.5 z-20">
              <button
                className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <Heart size={13} className="text-neutral-500" />
              </button>
            </div>
          </div>
        </Link>

        {/* ── Product strip ── */}
        {products.length > 0 && (
          <div className="grid grid-cols-4 gap-1 p-1.5">
            {visible.map((product: Product) => (
              <a
                key={product.id}
                href={product.affiliate_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-card overflow-hidden bg-neutral-100 block cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src={product.image_url} alt={product.name} fill sizes="8vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                <button
                  className="absolute bottom-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <Heart size={9} className="text-neutral-400" />
                </button>
              </a>
            ))}

            {/* 4th slot: overflow count or gray placeholder */}
            {overflow > 0 ? (
              <div className="aspect-square rounded-card bg-neutral-100 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-neutral-500">+{overflow}</span>
              </div>
            ) : (
              Array.from({ length: 4 - visible.length }).map((_, i) => (
                <div key={`ph-${i}`} className="aspect-square rounded-card bg-neutral-100" />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Grid wrapper ── */
interface MorePostsGridProps {
  posts: Post[];
  creatorDisplayName: string;
}

export default function MorePostsGrid({ posts, creatorDisplayName }: MorePostsGridProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section>
      <p className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 mb-4">
        More from {creatorDisplayName}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
