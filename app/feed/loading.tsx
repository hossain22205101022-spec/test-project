import PostCardSkeleton from "@/components/feed/PostCardSkeleton";

export default function FeedLoading() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 pt-4 pb-6">
      {/* Tab skeleton */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-20 rounded-full shimmer-bg animate-shimmer" />
        <div className="h-8 w-24 rounded-full shimmer-bg animate-shimmer" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
