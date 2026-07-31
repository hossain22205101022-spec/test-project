import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, createPost, createProducts, deletePost, updatePost } from "@/lib/supabase/admin-queries";
import type { Product } from "@/types";

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
    const { post: postInput, products: productsInput } = body;

    const hasMedia = !!postInput?.image_url || !!postInput?.video_url;
    if (!postInput?.creator_id || !hasMedia || !postInput?.description || !postInput?.slug) {
      return NextResponse.json(
        { error: "Missing required fields: creator_id, image_url or video_url, description, slug" },
        { status: 400 }
      );
    }

    const result = await createPost(postInput);

    if ("error" in result) {
      const isSlugConflict = result.error.includes("duplicate") || result.error.includes("unique");
      return NextResponse.json(
        { error: isSlugConflict ? "A post with this slug already exists. Please use a different slug." : result.error },
        { status: 400 }
      );
    }

    const post = result.post;

    // Create products if provided
    let createdProducts: Product[] = [];
    if (productsInput && productsInput.length > 0) {
      const productsWithPostId = productsInput.map(
        (p: { name: string; retailer: string; price?: string; affiliate_url: string; image_url: string }) => ({
          ...p,
          post_id: post.id,
        })
      );
      createdProducts = await createProducts(productsWithPostId);
    }

    return NextResponse.json({
      post,
      products: createdProducts,
    });
  } catch (err) {
    console.error("Admin create post error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, post: postInput, products: productsInput } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const hasMedia = !!postInput?.image_url || !!postInput?.video_url;
    if (!postInput?.creator_id || !hasMedia || !postInput?.description || !postInput?.slug) {
      return NextResponse.json(
        { error: "Missing required fields: creator_id, image_url or video_url, description, slug" },
        { status: 400 }
      );
    }

    const post = await updatePost(postId, postInput);
    if (!post) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    // Replace products: delete existing, then insert new list
    await supabase.from("products").delete().eq("post_id", postId);

    let updatedProducts: Product[] = [];
    if (productsInput && productsInput.length > 0) {
      const productsWithPostId = productsInput
        .filter((p: { name: string; affiliate_url: string }) => p.name && p.affiliate_url)
        .map((p: { name: string; retailer: string; price?: string; affiliate_url: string; image_url: string }) => ({
          ...p,
          post_id: postId,
        }));
      if (productsWithPostId.length > 0) {
        updatedProducts = await createProducts(productsWithPostId);
      }
    }

    return NextResponse.json({ post, products: updatedProducts });
  } catch (err) {
    console.error("Admin update post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const success = await deletePost(postId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete post" },
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
