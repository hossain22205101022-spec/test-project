"use client";

import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types";

interface TrendingPostsStripProps {
  posts: Post[];
}

export default function TrendingPostsStrip({ posts }: TrendingPostsStripProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section>
      <p className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 mb-4">
        Trending
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {posts.map((post) => {
          const username = post.creator?.username || "unknown";
          return (
            <Link
              key={post.id}
              href={`/feed/${username}/posts/${post.slug}`}
              className="flex-shrink-0 snap-start"
            >
              <div className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-card overflow-hidden bg-neutral-100">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt="Trending post"
                    fill
                    sizes="100px"
                    className="object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                    <span className="text-neutral-400 text-[10px] tracking-wide uppercase">Video</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
