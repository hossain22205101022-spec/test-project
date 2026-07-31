import type { Metadata } from "next";
import { getPaginatedFeed, getUserFollows, getUserSaves } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import FeedGrid from "@/components/feed/FeedGrid";
import { buildCanonicalUrl } from "@/lib/utils/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Feed",
    description:
      "Discover trending fashion and lifestyle content from top creators on StyleFeed.",
    alternates: {
      canonical: buildCanonicalUrl("/feed"),
    },
    openGraph: {
      title: "Feed | StyleFeed",
      description:
        "Discover trending fashion and lifestyle content from top creators on StyleFeed.",
      url: buildCanonicalUrl("/feed"),
      type: "website",
    },
  };
}

export default async function FeedPage() {
  const { posts } = await getPaginatedFeed(1, 12);

  // Check if user is authenticated and hydrate follow/save state
  let followIds: string[] = [];
  let saveIds: string[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      [followIds, saveIds] = await Promise.all([
        getUserFollows(user.id),
        getUserSaves(user.id),
      ]);
    }
  } catch {
    // Not authenticated, continue with empty state
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-5 pt-5 pb-8 sm:pt-6 sm:pb-10">
      {/* Feed Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button className="px-4 py-1.5 text-[11px] font-medium tracking-widest uppercase rounded-lg bg-neutral-900 text-white transition-colors">
          For You
        </button>
        <button className="px-4 py-1.5 text-[11px] font-medium tracking-widest uppercase rounded-lg border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-700 transition-colors">
          Following
        </button>
      </div>

      <FeedGrid
        initialPosts={posts}
        initialFollows={followIds}
        initialSaves={saveIds}
      />
    </section>
  );
}
