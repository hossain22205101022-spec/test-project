import { createClient } from "./server";
import type {
  Admin,
  Post,
  Creator,
  Product,
  CreatePostInput,
  CreateProductInput,
  CreateCreatorInput,
} from "@/types";

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .single();

  return !error && !!data;
}

/**
 * Get admin record for a user.
 */
export async function getAdminByUserId(
  userId: string
): Promise<Admin | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as Admin;
}

/**
 * Get all admins (for super_admin management).
 */
export async function getAllAdmins(): Promise<Admin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as Admin[];
}

/**
 * Get all creators for admin dashboard.
 */
export async function getAllCreators(): Promise<Creator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as Creator[];
}

/**
 * Get a single post by ID with creator and products.
 */
export async function getPostById(postId: string): Promise<Post | null> {
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
        avatar_url
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
    .eq("id", postId)
    .single();

  if (error) {
    console.error("Error fetching post by id:", error);
    return null;
  }
  return data as unknown as Post;
}

/**
 * Get all posts for admin dashboard with creator info.
 */
export async function getAllPosts(): Promise<Post[]> {
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
        avatar_url
      ),
      products (
        id,
        name,
        retailer,
        price,
        affiliate_url,
        image_url
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
  return (data || []) as unknown as Post[];
}

/**
 * Create a new creator.
 */
export async function createCreator(
  input: CreateCreatorInput
): Promise<Creator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creators")
    .insert({
      username: input.username,
      display_name: input.display_name,
      avatar_url: input.avatar_url || null,
      bio: input.bio || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating creator:", error);
    return null;
  }
  return data as Creator;
}

/**
 * Create a new post.
 */
export async function createPost(
  input: CreatePostInput
): Promise<{ post: Post } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: input.creator_id,
      image_url: input.image_url || null,
      video_url: input.video_url || null,
      description: input.description,
      hashtags: input.hashtags,
      slug: input.slug,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return { error: error.message };
  }
  return { post: data as unknown as Post };
}

/**
 * Create products for a post.
 */
export async function createProducts(
  products: CreateProductInput[]
): Promise<Product[]> {
  if (products.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(products)
    .select();

  if (error) {
    console.error("Error creating products:", error);
    return [];
  }
  return (data || []) as Product[];
}

/**
 * Delete a post by ID.
 */
export async function deletePost(postId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  return !error;
}

/**
 * Delete a creator by ID.
 */
export async function deleteCreator(creatorId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("creators")
    .delete()
    .eq("id", creatorId);
  return !error;
}

/**
 * Update a post.
 */
export async function updatePost(
  postId: string,
  updates: Partial<CreatePostInput>
): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    console.error("Error updating post:", error);
    return null;
  }
  return data as unknown as Post;
}

/**
 * Update a creator.
 */
export async function updateCreator(
  creatorId: string,
  updates: Partial<CreateCreatorInput>
): Promise<Creator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creators")
    .update(updates)
    .eq("id", creatorId)
    .select()
    .single();

  if (error) {
    console.error("Error updating creator:", error);
    return null;
  }
  return data as Creator;
}

/**
 * Upload a file to local storage.
 * Returns the public URL (relative path).
 * Note: This function requires client-side usage. For server-side, use the upload API route.
 */
export async function uploadMedia(
  file: File,
  folder: string = "images"
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Error uploading media:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error("Error uploading media:", error);
    return null;
  }
}

/**
 * Get dashboard stats.
 */
export async function getDashboardStats() {
  const supabase = await createClient();

  const [creatorsRes, postsRes, productsRes, followsRes] = await Promise.all([
    supabase.from("creators").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("follows").select("user_id", { count: "exact", head: true }),
  ]);

  return {
    totalCreators: creatorsRes.count || 0,
    totalPosts: postsRes.count || 0,
    totalProducts: productsRes.count || 0,
    totalFollows: followsRes.count || 0,
  };
}
