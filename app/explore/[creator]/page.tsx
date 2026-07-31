import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCreatorByUsername, getPostsByCreator } from "@/lib/supabase/queries";
import { buildCanonicalUrl } from "@/lib/utils/seo";
import { formatCount } from "@/lib/utils/formatters";
import Avatar from "@/components/shared/Avatar";

interface PageProps {
  params: Promise<{ creator: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { creator: username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return { title: "Creator Not Found" };
  }

  return {
    title: `${creator.display_name} (@${creator.username})`,
    description: creator.bio || `Check out ${creator.display_name}'s style posts on StyleFeed.`,
    alternates: {
      canonical: buildCanonicalUrl(`/explore/${username}`),
    },
    openGraph: {
      title: `${creator.display_name} | StyleFeed`,
      description: creator.bio || `Check out ${creator.display_name}'s style posts.`,
      images: creator.avatar_url ? [{ url: creator.avatar_url }] : [],
    },
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { creator: username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  const posts = await getPostsByCreator(creator.id, 20);

  return (
    <section className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-6">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar src={creator.avatar_url} alt={creator.display_name} size={72} />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-text-primary">
            {creator.display_name}
          </h1>
          <p className="text-sm text-text-secondary">@{creator.username}</p>
          <p className="text-sm text-text-secondary mt-1">
            {formatCount(creator.follower_count)} followers
          </p>
          {creator.bio && (
            <p className="text-sm text-text-primary mt-2 max-w-md">
              {creator.bio}
            </p>
          )}
        </div>
      </header>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/feed/${creator.username}/posts/${post.slug}`}
            className="relative aspect-square rounded-lg overflow-hidden group"
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
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-text-secondary py-12">
          No posts yet from this creator.
        </p>
      )}
    </section>
  );
}
