import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, createCreator, deleteCreator } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, display_name, avatar_url, bio } = body;

    if (!username || !display_name) {
      return NextResponse.json(
        { error: "Missing required fields: username, display_name" },
        { status: 400 }
      );
    }

    const creator = await createCreator({
      username,
      display_name,
      avatar_url,
      bio,
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Failed to create creator. Username may already exist." },
        { status: 500 }
      );
    }

    return NextResponse.json({ creator });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json(
        { error: "Missing creatorId" },
        { status: 400 }
      );
    }

    const success = await deleteCreator(creatorId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete creator" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
