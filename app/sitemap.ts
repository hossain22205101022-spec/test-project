import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/supabase/queries";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stylefeed.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/favorites`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  // Dynamic post pages
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPostSlugs();
    postPages = slugs.map((entry) => ({
      url: `${BASE_URL}/feed/${entry.creator_username}/posts/${entry.slug}`,
      lastModified: new Date(entry.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // If Supabase is not configured, return only static pages
  }

  return [...staticPages, ...postPages];
}
