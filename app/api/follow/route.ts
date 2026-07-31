import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleFollow } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { creatorId, action } = body;

    if (!creatorId || !["follow", "unfollow"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const isFollowing = action === "unfollow";
    const result = await toggleFollow(user.id, creatorId, isFollowing);

    if (result.error) {
      return NextResponse.json(
        { error: "Failed to update follow status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ isFollowing: result.isFollowing });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
