import { createClient } from "./server";
import type { Post, Creator, Product } from "@/types";

/**
 * Fetch paginated feed of posts with creator data, ordered by newest first.
 * Supports cursor-based pagination using created_at timestamp.
 */
export async function getPaginatedFeed(
  page: number = 1,
  limit: number = 12,
  cursor?: string
) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      `
      id,
      creator_id,
      image_url,
      video_url,
      description,
      hashtags,
      engagement,
      slug,
      created_at,
      creator:creators (
        id,
        username,
        display_name,
        avatar_url,
        follower_count,
        bio
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  } else if (page > 1) {
    query = query.range((page - 1) * limit, page * limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching feed:", error);
    return { posts: [] as Post[], nextCursor: null };
  }

  const posts = (data || []) as unknown as Post[];
  const nextCursor =
    posts.length === limit ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

/**
 * Fetch paginated reels (video only).
 */
export async function getReelsFeed(
  page: number = 1,
  limit: number = 10,
  cursor?: string
) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      `
      id,
      creator_id,
      image_url,
      video_url,
      description,
      hashtags,
      engagement,
      slug,
      created_at,
      creator:creators (
        id,
        username,
        display_name,
        avatar_url,
        follower_count,
        bio
      ),
      products (
        id,
        post_id,
        name,
        retailer,
        price,
        affiliate_url,
        image_url
      )
    `
    )
    .not('video_url', 'is', null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  } else if (page > 1) {
    query = query.range((page - 1) * limit, page * limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reels:", error);
    return { posts: [] as Post[], nextCursor: null };
  }

  const posts = (data || []) as unknown as Post[];
  const nextCursor =
    posts.length === limit ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

/**
 * Fetch a single post by creator username and post slug, including products.
 */
export async function getPostBySlug(
  creatorUsername: string,
  slug: string
): Promise<Post | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      creator_id,
      image_url,
      video_url,
      description,
      hashtags,
      engagement,
      slug,
      created_at,
      creator:creators!inner (
        id,
        username,
        display_name,
        avatar_url,
        follower_count,
        bio
      ),
      products (
        id,
        post_id,
        name,
        retailer,
        price,
        affiliate_url,
        image_url
      )
    `
    )
    .eq("slug", slug)
    .eq("creators.username", creatorUsername)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data as unknown as Post;
}

/**
 * Fetch more posts from the same creator, excluding the current post.
 */
export async function getMorePostsByCreator(
  creatorId: string,
  excludePostId: string,
  limit: number = 6
): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      image_url,
      video_url,
      slug,
      created_at,
      creator:creators (
        username,
        display_name
      ),
      products (
        id,
        name,
        image_url,
        affiliate_url
      )
    `
    )
    .eq("creator_id", creatorId)
    .neq("id", excludePostId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching more posts:", error);
    return [];
  }

  return (data || []) as unknown as Post[];
}

/**
 * Fetch trending posts by a creator, ordered by likes descending.
 */
export async function getTrendingPostsByCreator(
  creatorId: string,
  limit: number = 10
): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      image_url,
      slug,
      engagement,
      created_at,
      creator:creators (
        username
      )
    `
    )
    .eq("creator_id", creatorId)
    .order("engagement->likes", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching trending posts:", error);
    return [];
  }

  return (data || []) as unknown as Post[];
}

/**
 * Toggle follow status between a user and a creator.
 */
export async function toggleFollow(
  userId: string,
  creatorId: string,
  isFollowing: boolean
) {
  const supabase = await createClient();

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("user_id", userId)
      .eq("creator_id", creatorId);

    if (!error) {
      await supabase.rpc("increment_follower_count", {
        creator_id_input: creatorId,
        increment_value: -1,
      });
    }

    return { isFollowing: false, error };
  } else {
    // Follow
    const { error } = await supabase
      .from("follows")
      .upsert({ user_id: userId, creator_id: creatorId });

    if (!error) {
      await supabase.rpc("increment_follower_count", {
        creator_id_input: creatorId,
        increment_value: 1,
      });
    }

    return { isFollowing: true, error };
  }
}

/**
 * Toggle save/unsave a post for a user.
 */
export async function toggleSave(
  userId: string,
  postId: string,
  isSaved: boolean
) {
  const supabase = await createClient();

  if (isSaved) {
    // Unsave
    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    return { isSaved: false, error };
  } else {
    // Save
    const { error } = await supabase
      .from("saves")
      .upsert({ user_id: userId, post_id: postId });

    return { isSaved: true, error };
  }
}

/**
 * Get all creator IDs that a user follows.
 */
export async function getUserFollows(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user follows:", error);
    return [];
  }

  return (data || []).map((row) => row.creator_id);
}

/**
 * Get all post IDs that a user has saved.
 */
export async function getUserSaves(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saves")
    .select("post_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user saves:", error);
    return [];
  }

  return (data || []).map((row) => row.post_id);
}

/**
 * Get all post slugs for sitemap generation.
 */
export async function getAllPostSlugs(): Promise<
  { slug: string; creator_username: string; updated_at: string }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      slug,
      created_at,
      creator:creators (
        username
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all post slugs:", error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    slug: row.slug as string,
    creator_username: (row.creator as Record<string, string>)?.username || "",
    updated_at: row.created_at as string,
  }));
}

/**
 * Get user saved posts with full post data.
 */
export async function getUserSavedPosts(userId: string): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saves")
    .select(
      `
      post:posts (
        id,
        creator_id,
        image_url,
        video_url,
        description,
        hashtags,
        engagement,
        slug,
        created_at,
        creator:creators (
          id,
          username,
          display_name,
          avatar_url,
          follower_count
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }

  return (data || []).map(
    (row: Record<string, unknown>) => row.post
  ) as unknown as Post[];
}

/**
 * Get creator profile by username.
 */
export async function getCreatorByUsername(
  username: string
): Promise<Creator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creators")
    .select("id, username, display_name, avatar_url, follower_count, bio, created_at")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching creator:", error);
    return null;
  }

  return data as Creator;
}

/**
 * Get posts by creator username.
 */
export async function getPostsByCreator(
  creatorId: string,
  limit: number = 20
): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      image_url,
      video_url,
      description,
      hashtags,
      engagement,
      slug,
      created_at,
      creator:creators (
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching creator posts:", error);
    return [];
  }

  return (data || []) as unknown as Post[];
}

/**
 * Get posts by hashtag.
 */
export async function getPostsByHashtag(
  tag: string,
  limit: number = 20
): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      creator_id,
      image_url,
      video_url,
      description,
      hashtags,
      engagement,
      slug,
      created_at,
      creator:creators (
        id,
        username,
        display_name,
        avatar_url,
        follower_count
      )
    `
    )
    .contains("hashtags", [tag])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching posts by hashtag:", error);
    return [];
  }

  return (data || []) as unknown as Post[];
}
