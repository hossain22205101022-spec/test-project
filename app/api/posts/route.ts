import { NextRequest, NextResponse } from "next/server";
import { getPaginatedFeed } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  const { posts, nextCursor } = await getPaginatedFeed(1, limit, cursor);

  return NextResponse.json({ posts, nextCursor });
}
