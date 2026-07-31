import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleSave } from "@/lib/supabase/queries";

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
    const { postId, action } = body;

    if (!postId || !["save", "unsave"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const isSaved = action === "unsave";
    const result = await toggleSave(user.id, postId, isSaved);

    if (result.error) {
      return NextResponse.json(
        { error: "Failed to update save status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ isSaved: result.isSaved });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
