export default function PostCardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Creator Row Skeleton */}
      <div className="flex items-center gap-2 py-2.5 px-0.5">
        <div className="w-7 h-7 rounded-full shimmer-bg animate-shimmer shrink-0" />
        <div className="h-3 w-20 rounded shimmer-bg animate-shimmer" />
        <div className="ml-auto w-5 h-5 rounded-full shimmer-bg animate-shimmer" />
      </div>

      {/* Image Skeleton */}
      <div className="aspect-[9/16] rounded-card shimmer-bg animate-shimmer" />
    </div>
  );
}
