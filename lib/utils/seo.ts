const SITE_NAME = "StyleFeed";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stylefeed.com";

export function getBaseUrl(): string {
  return BASE_URL;
}

export function getSiteName(): string {
  return SITE_NAME;
}

export function buildCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export function buildOgImageUrl(imageUrl: string): string {
  return imageUrl;
}

export function buildPostUrl(creatorUsername: string, postSlug: string): string {
  return `${BASE_URL}/feed/${creatorUsername}/posts/${postSlug}`;
}

export function buildCreatorUrl(username: string): string {
  return `${BASE_URL}/explore/${username}`;
}
