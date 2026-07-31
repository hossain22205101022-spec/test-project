import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserSavedPosts } from "@/lib/supabase/queries";
import { buildCanonicalUrl } from "@/lib/utils/seo";
import type { Post } from "@/types";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved posts on StyleFeed.",
  alternates: {
    canonical: buildCanonicalUrl("/favorites"),
  },
};

export default async function FavoritesPage() {
  let savedPosts: Post[] = [];
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      savedPosts = await getUserSavedPosts(user.id);
    }
  } catch {
    // Not authenticated
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Favorites</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your saved style inspiration
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">
            Sign in to save your favorite posts.
          </p>
          <Link
            href="/api/auth/login"
            className="inline-flex items-center px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            You haven&apos;t saved any posts yet. Tap the heart icon on posts you love!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedPosts.map((post) => {
            const username = post.creator?.username || "unknown";
            return (
              <Link
                key={post.id}
                href={`/feed/${username}/posts/${post.slug}`}
                className="relative aspect-square rounded-card overflow-hidden group"
              >
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.description || "Saved post"}
                    fill
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <span className="text-gray-400 text-xs">Video</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
