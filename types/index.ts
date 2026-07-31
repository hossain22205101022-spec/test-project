export interface Creator {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  bio: string;
  created_at: string;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
}

export interface Post {
  id: string;
  creator_id: string;
  image_url: string | null;
  video_url: string | null;
  description: string;
  hashtags: string[];
  engagement: Engagement;
  slug: string;
  created_at: string;
  creator?: Creator;
  products?: Product[];
}

export interface Product {
  id: string;
  post_id: string;
  name: string;
  retailer: string;
  price: string | null;
  affiliate_url: string;
  image_url: string;
}

export interface Follow {
  user_id: string;
  creator_id: string;
  created_at: string;
}

export interface Save {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: "admin" | "super_admin";
  created_at: string;
}

export interface CreatePostInput {
  creator_id: string;
  image_url?: string;
  video_url?: string;
  description: string;
  hashtags: string[];
  slug: string;
}

export interface CreateProductInput {
  post_id: string;
  name: string;
  retailer: string;
  price?: string;
  affiliate_url: string;
  image_url: string;
}

export interface CreateCreatorInput {
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  author_id?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// hi this is the end of this code file
