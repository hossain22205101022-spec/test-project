import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ posts: [], creators: [], hashtags: [] });
  }

  const supabase = await createClient();
  const searchTerm = `%${query}%`;

  // Run all three queries in parallel
  const [postsResult, creatorsResult, hashtagsResult] = await Promise.all([
    // Search posts by description (ilike for case-insensitive)
    supabase
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
      .or(`description.ilike.${searchTerm}`)
      .order("created_at", { ascending: false })
      .limit(20),

    // Search creators by username or display_name
    supabase
      .from("creators")
      .select("id, username, display_name, avatar_url, follower_count, bio")
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .order("follower_count", { ascending: false })
      .limit(10),

    // Search posts that contain the query as a hashtag
    supabase
      .from("posts")
      .select("hashtags")
      .contains("hashtags", [query.toLowerCase().replace(/^#/, "")])
      .limit(1),
  ]);

  // Also find posts matching hashtags (search term without #)
  const hashtagTerm = query.toLowerCase().replace(/^#/, "");
  const hashtagPostsResult = await supabase
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
    .contains("hashtags", [hashtagTerm])
    .order("created_at", { ascending: false })
    .limit(20);

  // Merge post results, deduplicating by id
  const postMap = new Map<string, unknown>();
  for (const post of postsResult.data || []) {
    const p = post as { id: string };
    postMap.set(p.id, post);
  }
  for (const post of hashtagPostsResult.data || []) {
    const p = post as { id: string };
    postMap.set(p.id, post);
  }

  // Extract unique hashtags from matched posts for suggestions
  const tagSet = new Set<string>();
  for (const post of postMap.values()) {
    const p = post as Record<string, unknown>;
    const tags = p.hashtags as string[] | undefined;
    if (tags) {
      for (const t of tags) {
        if (t.toLowerCase().includes(hashtagTerm)) {
          tagSet.add(t);
        }
      }
    }
  }

  return NextResponse.json({
    posts: Array.from(postMap.values()),
    creators: creatorsResult.data || [],
    hashtags: Array.from(tagSet).slice(0, 10),
  });
}
