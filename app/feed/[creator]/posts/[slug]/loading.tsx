export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 lg:px-5 py-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">

        {/* Left: 9:16 media skeleton */}
        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
          <div className="w-full aspect-[9/16] rounded-xl shimmer-bg animate-shimmer" />
        </div>

        {/* Right: creator + caption + likes + products */}
        <div className="flex-1 min-w-0 mt-5 lg:mt-0 space-y-5">

          {/* Creator strip */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shimmer-bg animate-shimmer shrink-0" />
            <div className="h-4 w-28 rounded shimmer-bg animate-shimmer" />
            <div className="h-8 w-20 rounded-full shimmer-bg animate-shimmer ml-2" />
          </div>

          {/* Caption lines */}
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full rounded shimmer-bg animate-shimmer" />
            <div className="h-4 w-4/5 rounded shimmer-bg animate-shimmer" />
            <div className="h-4 w-3/5 rounded shimmer-bg animate-shimmer" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-16 rounded shimmer-bg animate-shimmer" />
              <div className="h-4 w-20 rounded shimmer-bg animate-shimmer" />
            </div>
          </div>

          {/* Likes row */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <div className="w-6 h-6 rounded shimmer-bg animate-shimmer" />
            <div className="h-4 w-16 rounded shimmer-bg animate-shimmer" />
          </div>

          {/* Products */}
          <div className="space-y-3 pt-1">
            <div className="h-5 w-32 rounded shimmer-bg animate-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-[180px] rounded-xl shimmer-bg animate-shimmer" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
