import { getReelsFeed } from "@/lib/supabase/queries";
import ReelsFeed from "./ReelsFeed";

export const metadata = {
  title: "Reels | Explore",
  description: "Explore the best Amazon FBA product reels.",
};

export default async function ExplorePage() {
  const { posts } = await getReelsFeed(1, 10);

  return (
    <div className="bg-bg w-full h-[100dvh] pt-0 lg:pt-[72px] pb-[56px] lg:pb-0 overflow-hidden flex flex-col">
      <ReelsFeed initialPosts={posts} />
    </div>
  );
}
