import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getMorePostsByCreator,
  getTrendingPostsByCreator,
  getUserFollows,
  getUserSaves,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { buildCanonicalUrl, buildPostUrl, getSiteName } from "@/lib/utils/seo";
import { truncate } from "@/lib/utils/formatters";
import PostDetailClient from "./PostDetailClient";

// Force dynamic rendering to avoid static generation issues on Hostinger
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ creator: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { creator, slug } = await params;
    const decodedCreator = decodeURIComponent(creator);
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPostBySlug(decodedCreator, decodedSlug);

    if (!post) {
      return { title: "Post Not Found" };
    }

    const creatorName = post.creator?.display_name || creator;
    const title = `${truncate(post.description, 60)} by ${creatorName}`;
    const url = buildPostUrl(decodedCreator, decodedSlug);

    return {
      title,
      description: post.description,
      alternates: {
        canonical: buildCanonicalUrl(`/feed/${decodedCreator}/posts/${decodedSlug}`),
      },
      openGraph: {
        title,
        description: post.description,
        type: "article",
        url,
        siteName: getSiteName(),
        images: post.image_url
          ? [{ url: post.image_url, width: 600, height: 800, alt: post.description }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: post.description,
        images: post.image_url ? [post.image_url] : [],
      },
    };
  } catch (error) {
    console.error("generateMetadata error:", error);
    return { title: "Post" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  try {
    const { creator, slug } = await params;
    const decodedCreator = decodeURIComponent(creator);
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPostBySlug(decodedCreator, decodedSlug);

    if (!post || !post.creator) {
      notFound();
    }

    // Fetch related posts in parallel
    const [morePosts, trendingPosts] = await Promise.all([
      getMorePostsByCreator(post.creator_id, post.id, 6),
      getTrendingPostsByCreator(post.creator_id, 10),
    ]);

    // Check auth state
    let isFollowing = false;
    let isSaved = false;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [followIds, saveIds] = await Promise.all([
          getUserFollows(user.id),
          getUserSaves(user.id),
        ]);
        isFollowing = followIds.includes(post.creator_id);
        isSaved = saveIds.includes(post.id);
      }
    } catch {
      // Not authenticated - continue without auth state
    }

    const postUrl = buildPostUrl(decodedCreator, decodedSlug);

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: truncate(post.description, 110),
      image: post.image_url ?? undefined,
      author: {
        "@type": "Person",
        name: post.creator.display_name,
        url: buildCanonicalUrl(`/explore/${post.creator.username}`),
      },
      datePublished: post.created_at,
      publisher: {
        "@type": "Organization",
        name: getSiteName(),
      },
      mainEntityOfPage: postUrl,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostDetailClient
          post={post}
          morePosts={morePosts}
          trendingPosts={trendingPosts}
          isFollowing={isFollowing}
          isSaved={isSaved}
          postUrl={postUrl}
        />
      </>
    );
  } catch (error) {
    console.error("PostDetailPage error:", error);
    notFound();
  }
}
