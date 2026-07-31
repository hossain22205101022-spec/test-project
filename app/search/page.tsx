"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Hash, ArrowLeft, Play } from "lucide-react";
import type { Post, Creator } from "@/types";
import Avatar from "@/components/shared/Avatar";

interface SearchResults {
  posts: Post[];
  creators: Creator[];
  hashtags: string[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResults>({
    posts: [],
    creators: [],
    hashtags: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ posts: [], creators: [], hashtags: [] });
      return;
    }

    const controller = new AbortController();

    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
    return () => controller.abort();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  const totalResults = results.posts.length + results.creators.length;
  const hasResults = totalResults > 0 || results.hashtags.length > 0;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-6">
      {/* Back + Search bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/feed"
          className="shrink-0 p-2 -ml-2 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>

        <form onSubmit={handleSubmit} className="relative flex-1 max-w-xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search creators, posts, hashtags…"
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/40 transition-all"
          />
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-neutral-200 border-t-accent animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && query && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-neutral-200 mb-4" />
          <p className="text-sm font-medium text-neutral-500">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Try a different keyword or check your spelling
          </p>
        </div>
      )}

      {/* Initial state */}
      {!loading && !query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-neutral-200 mb-4" />
          <p className="text-sm font-medium text-neutral-500">
            Search for creators, posts, or hashtags
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Find your favorite styles
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-8">
          {/* Hashtag suggestions */}
          {results.hashtags.length > 0 && (
            <section>
              <h2 className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                Hashtags
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/hashtag/${encodeURIComponent(tag)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200/60 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <Hash size={12} className="text-neutral-400" />
                    {tag}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Creators */}
          {results.creators.length > 0 && (
            <section>
              <h2 className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                Creators
              </h2>
              <div className="grid gap-2">
                {results.creators.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/explore/${creator.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <Avatar
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-900 group-hover:text-accent transition-colors truncate">
                        {creator.display_name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        @{creator.username}
                        {creator.follower_count > 0 && (
                          <span className="ml-2">
                            {creator.follower_count.toLocaleString()} followers
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <section>
              <h2 className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                Posts
                <span className="ml-2 text-neutral-300">
                  {results.posts.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {results.posts.map((post) => {
                  const creator = post.creator;
                  const postUrl = `/feed/${creator?.username || "unknown"}/posts/${post.slug}`;

                  return (
                    <div key={post.id} className="flex flex-col">
                      {creator && (
                        <div className="flex items-center gap-2 py-2 px-0.5">
                          <Link
                            href={`/explore/${creator.username}`}
                            className="shrink-0"
                          >
                            <Avatar
                              src={creator.avatar_url}
                              alt={creator.display_name}
                              size={28}
                            />
                          </Link>
                          <Link
                            href={`/explore/${creator.username}`}
                            className="text-xs font-medium text-neutral-900 hover:text-accent transition-colors truncate"
                          >
                            {creator.display_name}
                          </Link>
                        </div>
                      )}
                      <Link
                        href={postUrl}
                        className="block relative aspect-[9/16] rounded-card overflow-hidden bg-neutral-100"
                      >
                        {post.image_url ? (
                          <Image
                            src={post.image_url}
                            alt={post.description || "Post"}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : post.video_url ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                            <Play
                              size={28}
                              className="text-white/80"
                              fill="currentColor"
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-neutral-300">
                              No media
                            </span>
                          </div>
                        )}
                      </Link>
                      {post.description && (
                        <p className="mt-1.5 text-[11px] text-neutral-500 line-clamp-2 px-0.5">
                          {post.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-6 flex items-center justify-center min-h-[50vh]">
          <div className="h-6 w-6 rounded-full border-2 border-neutral-200 border-t-accent animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
