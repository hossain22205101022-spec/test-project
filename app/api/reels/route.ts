import { NextRequest, NextResponse } from "next/server";
import { getReelsFeed } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const { posts, nextCursor } = await getReelsFeed(1, limit, cursor);

  return NextResponse.json({ posts, nextCursor });
}
