import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPostsByHashtag } from "@/lib/supabase/queries";
import { buildCanonicalUrl } from "@/lib/utils/seo";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag}`,
    description: `Explore posts tagged with #${decodedTag} on StyleFeed.`,
    alternates: {
      canonical: buildCanonicalUrl(`/hashtag/${tag}`),
    },
  };
}

export default async function HashtagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByHashtag(decodedTag, 20);

  return (
    <section className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-accent">#{decodedTag}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {posts.map((post) => {
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
                  alt={post.description || "Post"}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
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

      {posts.length === 0 && (
        <p className="text-center text-text-secondary py-12">
          No posts found with this hashtag.
        </p>
      )}
    </section>
  );
}
