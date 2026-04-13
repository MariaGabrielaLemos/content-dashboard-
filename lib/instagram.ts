const BASE = "https://graph.facebook.com/v21.0";
const TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ID = process.env.INSTAGRAM_ACCOUNT_ID;

function url(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN ?? "", ...params });
  return `${BASE}${path}?${qs}`;
}

export interface IGProfile {
  username: string;
  name: string;
  followers_count: number;
  media_count: number;
  profile_picture_url: string;
}

export interface IGMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}

export async function getProfile(): Promise<IGProfile | null> {
  try {
    const res = await fetch(
      url(`/${IG_ID}`, {
        fields: "username,name,followers_count,media_count,profile_picture_url",
      }),
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getRecentMedia(limit = 10): Promise<IGMedia[]> {
  try {
    const res = await fetch(
      url(`/${IG_ID}/media`, {
        fields:
          "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
        limit: String(limit),
      }),
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}
