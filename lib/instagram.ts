/**
 * Instagram Graph API client.
 *
 * Suporta dois esquemas de credencial:
 *   - "Legacy" Facebook Login: META_ACCESS_TOKEN + INSTAGRAM_ACCOUNT_ID
 *   - "Nova" Login do Instagram (sem FB): INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID
 * O cliente prefere a nova quando ambos existem; cai pro legacy se faltar.
 */
const BASE = "https://graph.facebook.com/v21.0";

const TOKEN =
  process.env.INSTAGRAM_ACCESS_TOKEN ?? process.env.META_ACCESS_TOKEN ?? "";
const IG_ID =
  process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ??
  process.env.INSTAGRAM_ACCOUNT_ID ??
  "";

export const isConfigured = Boolean(TOKEN && IG_ID);

function url(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params });
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
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  /** Insights enriquecidos (preenchido sob demanda em getMediaWithInsights). */
  reach?: number;
  impressions?: number;
  saved?: number;
  shares?: number;
  plays?: number;
}

export async function getProfile(): Promise<IGProfile | null> {
  if (!isConfigured) return null;
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

export async function getRecentMedia(limit = 25): Promise<IGMedia[]> {
  if (!isConfigured) return [];
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

/** Insights por mídia — alcance, salvamentos, compartilhamentos. */
async function getMediaInsights(
  mediaId: string,
  mediaType: IGMedia["media_type"]
): Promise<Partial<IGMedia>> {
  if (!isConfigured) return {};
  // Reels e vídeos têm métricas diferentes
  const fields =
    mediaType === "VIDEO" || mediaType === "REELS"
      ? "reach,saved,shares,plays"
      : "reach,impressions,saved,shares";
  try {
    const res = await fetch(url(`/${mediaId}/insights`, { metric: fields }), {
      next: { revalidate: 600 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const out: Partial<IGMedia> = {};
    for (const item of json.data ?? []) {
      const v = item.values?.[0]?.value ?? 0;
      if (item.name === "reach") out.reach = v;
      if (item.name === "impressions") out.impressions = v;
      if (item.name === "saved") out.saved = v;
      if (item.name === "shares") out.shares = v;
      if (item.name === "plays") out.plays = v;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Busca mídias recentes + insights por mídia em paralelo (limitado por chunk).
 * Tolerante a falha: posts sem insights ainda são retornados sem reach/impressions.
 */
export async function getMediaWithInsights(limit = 60): Promise<IGMedia[]> {
  const media = await getRecentMedia(limit);
  if (media.length === 0) return [];

  const enriched = await Promise.all(
    media.map(async (m) => {
      const ins = await getMediaInsights(m.id, m.media_type);
      return { ...m, ...ins };
    })
  );
  return enriched;
}

/** User insights (snapshot do perfil) — reach/impressions/profile_views agregados. */
export interface IGUserInsights {
  reach_28d: number;
  impressions_28d: number;
  profile_views_28d: number;
  follower_count_change_28d: number;
}

export async function getUserInsights(): Promise<IGUserInsights | null> {
  if (!isConfigured) return null;
  try {
    const res = await fetch(
      url(`/${IG_ID}/insights`, {
        metric: "reach,impressions,profile_views,follower_count",
        period: "days_28",
      }),
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const out: IGUserInsights = {
      reach_28d: 0,
      impressions_28d: 0,
      profile_views_28d: 0,
      follower_count_change_28d: 0,
    };
    for (const item of json.data ?? []) {
      const total = (item.values ?? []).reduce(
        (s: number, v: { value?: number }) => s + (v.value ?? 0),
        0
      );
      if (item.name === "reach") out.reach_28d = total;
      if (item.name === "impressions") out.impressions_28d = total;
      if (item.name === "profile_views") out.profile_views_28d = total;
      if (item.name === "follower_count") out.follower_count_change_28d = total;
    }
    return out;
  } catch {
    return null;
  }
}

/** Audience demographics (faixa etária + gênero). */
export interface IGAudience {
  age: { range: string; percent: number }[];
  gender: { label: string; percent: number }[];
  topCities: { city: string; percent: number }[];
}

export async function getAudience(): Promise<IGAudience | null> {
  if (!isConfigured) return null;
  try {
    const res = await fetch(
      url(`/${IG_ID}/insights`, {
        metric: "audience_gender_age,audience_city",
        period: "lifetime",
      }),
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();

    const ageMap: Record<string, number> = {};
    const genderMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};

    for (const item of json.data ?? []) {
      const v: Record<string, number> = item.values?.[0]?.value ?? {};
      if (item.name === "audience_gender_age") {
        for (const [key, count] of Object.entries(v)) {
          const [g, range] = key.split(".");
          ageMap[range] = (ageMap[range] ?? 0) + count;
          genderMap[g] = (genderMap[g] ?? 0) + count;
        }
      } else if (item.name === "audience_city") {
        Object.assign(cityMap, v);
      }
    }

    const ageTotal = Object.values(ageMap).reduce((s, n) => s + n, 0);
    const age = Object.entries(ageMap)
      .map(([range, count]) => ({
        range,
        percent: ageTotal ? (count / ageTotal) * 100 : 0,
      }))
      .sort((a, b) => a.range.localeCompare(b.range));

    const gTotal = Object.values(genderMap).reduce((s, n) => s + n, 0);
    const labelMap: Record<string, string> = { F: "Feminino", M: "Masculino", U: "Outro" };
    const gender = Object.entries(genderMap).map(([k, count]) => ({
      label: labelMap[k] ?? k,
      percent: gTotal ? (count / gTotal) * 100 : 0,
    }));

    const cTotal = Object.values(cityMap).reduce((s, n) => s + n, 0);
    const topCities = Object.entries(cityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({
        city,
        percent: cTotal ? (count / cTotal) * 100 : 0,
      }));

    return { age, gender, topCities };
  } catch {
    return null;
  }
}
