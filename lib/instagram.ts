import { promises as fs } from "fs";
import path from "path";

/**
 * Instagram Graph API client.
 *
 * Detecta automaticamente o esquema do token:
 *
 *   - Prefixo `IGAA*` → "Nova" Login do Instagram (sem Facebook):
 *       base = https://graph.instagram.com/v21.0
 *       path = /me  (o token identifica o usuário)
 *       env  = INSTAGRAM_ACCESS_TOKEN [+ INSTAGRAM_BUSINESS_ACCOUNT_ID opcional]
 *
 *   - Prefixo `EAA*`  → "Legacy" Facebook Login:
 *       base = https://graph.facebook.com/v21.0
 *       path = /{IG_ID}  (precisa do business account ID)
 *       env  = META_ACCESS_TOKEN + INSTAGRAM_ACCOUNT_ID
 *             (fallback: INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID)
 */

const TOKEN =
  process.env.INSTAGRAM_ACCESS_TOKEN ?? process.env.META_ACCESS_TOKEN ?? "";
const IG_ID =
  process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ??
  process.env.INSTAGRAM_ACCOUNT_ID ??
  "";

type Scheme = "instagram-login" | "facebook-login";

function detectScheme(token: string): Scheme {
  // IGAA = Instagram Login token (sem Facebook). EAA = Facebook Graph token.
  return token.startsWith("IGAA") ? "instagram-login" : "facebook-login";
}

const SCHEME = detectScheme(TOKEN);
const BASE =
  SCHEME === "instagram-login"
    ? "https://graph.instagram.com/v21.0"
    : "https://graph.facebook.com/v21.0";

/** Caminho para o "self" do usuário/conta. Varia por esquema. */
const SELF_PATH = SCHEME === "instagram-login" ? "/me" : `/${IG_ID}`;

export const isConfigured = Boolean(TOKEN) && (SCHEME === "instagram-login" || Boolean(IG_ID));

function url(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params });
  return `${BASE}${path}?${qs}`;
}

interface ApiError {
  endpoint: string;
  status?: number;
  code?: number;
  message?: string;
}

const errorLog: ApiError[] = [];

function logApiError(endpoint: string, status: number | undefined, body: unknown) {
  const err = (body as { error?: { code?: number; message?: string } })?.error;
  const entry: ApiError = {
    endpoint,
    status,
    code: err?.code,
    message: err?.message,
  };
  errorLog.push(entry);
  // Server-side log também
  console.warn(`[instagram] ${endpoint} → ${status} code=${err?.code} ${err?.message ?? ""}`);
}

/** Snapshot dos últimos erros (pra UI debug). */
export function getRecentErrors(): ApiError[] {
  return errorLog.slice(-20);
}

export interface IGProfile {
  username: string;
  name?: string;
  followers_count: number;
  media_count: number;
  profile_picture_url?: string;
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
  /** Views: nova métrica unificada (Meta v22+) que substitui plays e impressions para reels/vídeos. */
  views?: number;
  saved?: number;
  shares?: number;
  /** Total de interações (likes + comments + saves + shares). Calculado pela Meta. */
  total_interactions?: number;
  /** @deprecated Meta v22+ removeu — use `views`. Mantido pra compat. */
  plays?: number;
  /** @deprecated Meta v22+ removeu — use `views`. */
  impressions?: number;
}

export async function getProfile(): Promise<IGProfile | null> {
  if (!isConfigured) return null;
  const endpoint = `${SELF_PATH}?fields=username,name,followers_count,media_count,profile_picture_url`;
  try {
    const res = await fetch(url(SELF_PATH, {
      fields: "username,name,followers_count,media_count,profile_picture_url",
    }), { next: { revalidate: 300 } });
    if (!res.ok) {
      logApiError(endpoint, res.status, await res.json().catch(() => null));
      return null;
    }
    const data = await res.json();
    if (data.error) {
      logApiError(endpoint, res.status, data);
      return null;
    }
    return data;
  } catch (e) {
    console.warn("[instagram] getProfile threw:", e);
    return null;
  }
}

export async function getRecentMedia(limit = 25): Promise<IGMedia[]> {
  if (!isConfigured) return [];
  const fields =
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
  const endpoint = `${SELF_PATH}/media?fields=${fields}&limit=${limit}`;
  try {
    const res = await fetch(
      url(`${SELF_PATH}/media`, { fields, limit: String(limit) }),
      { next: { revalidate: 300 } }
    );
    if (!res.ok) {
      logApiError(endpoint, res.status, await res.json().catch(() => null));
      return [];
    }
    const json = await res.json();
    if (json.error) {
      logApiError(endpoint, res.status, json);
      return [];
    }
    return json.data ?? [];
  } catch (e) {
    console.warn("[instagram] getRecentMedia threw:", e);
    return [];
  }
}

/** Insights por mídia — Meta v22+: views substitui plays/impressions. */
async function getMediaInsights(
  mediaId: string,
  mediaType: IGMedia["media_type"]
): Promise<Partial<IGMedia>> {
  if (!isConfigured) return {};
  // v22+ metrics (https://developers.facebook.com/docs/instagram-platform/api-reference/instagram-media/insights)
  // VIDEO/REELS: reach, saved, shares, views, total_interactions, comments, likes
  // IMAGE/CAROUSEL: reach, saved, shares, views, total_interactions
  const fields = "reach,saved,shares,views,total_interactions";
  const endpoint = `/${mediaId}/insights?metric=${fields}`;
  try {
    const res = await fetch(url(`/${mediaId}/insights`, { metric: fields }), {
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      logApiError(endpoint, res.status, await res.json().catch(() => null));
      return {};
    }
    const json = await res.json();
    if (json.error) {
      logApiError(endpoint, res.status, json);
      return {};
    }
    const out: Partial<IGMedia> = {};
    for (const item of json.data ?? []) {
      const v = item.values?.[0]?.value ?? item.value ?? 0;
      if (item.name === "reach") out.reach = v;
      if (item.name === "views") {
        out.views = v;
        // mirror em `plays` pra retrocompat com código que ainda lê .plays
        out.plays = v;
      }
      if (item.name === "saved") out.saved = v;
      if (item.name === "shares") out.shares = v;
      if (item.name === "total_interactions") out.total_interactions = v;
    }
    // Suprimir o warning de mediaType não-usado (mantido pra compat futura)
    void mediaType;
    return out;
  } catch (e) {
    console.warn(`[instagram] getMediaInsights(${mediaId}) threw:`, e);
    return {};
  }
}

/**
 * Cache disco simples pra getMediaWithInsights — evita 60+ chamadas Meta a cada render.
 * TTL default 1h. Chave por (IG_ID, limit). Arquivos em `_cache/insights-{key}.json`.
 *
 * NÃO usar em prod (Vercel é stateless). Pra produção, trocar por Supabase/Redis.
 */
const CACHE_DIR = path.join(process.cwd(), "_cache");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

interface CachedPayload {
  fetched_at: string;
  ttl_ms: number;
  data: IGMedia[];
}

async function readCache(key: string): Promise<CachedPayload | null> {
  try {
    const file = path.join(CACHE_DIR, `insights-${key}.json`);
    const raw = await fs.readFile(file, "utf-8");
    const payload = JSON.parse(raw) as CachedPayload;
    const age = Date.now() - new Date(payload.fetched_at).getTime();
    if (age > payload.ttl_ms) return null;
    return payload;
  } catch {
    return null;
  }
}

async function writeCache(key: string, data: IGMedia[]): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const file = path.join(CACHE_DIR, `insights-${key}.json`);
    const payload: CachedPayload = {
      fetched_at: new Date().toISOString(),
      ttl_ms: CACHE_TTL_MS,
      data,
    };
    await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf-8");
  } catch (e) {
    console.warn("[instagram] cache write failed:", e);
  }
}

/** Quando os dados foram coletados (cache hit) ou re-fetched (cache miss). */
let lastFetchedAt: string | null = null;
export function getLastFetchedAt(): string | null {
  return lastFetchedAt;
}

/**
 * Busca mídias recentes + insights por mídia em paralelo, com cache disco 1h.
 * Tolerante a falha: posts sem insights ainda são retornados sem reach/impressions.
 */
export async function getMediaWithInsights(
  limit = 60,
  options: { bypassCache?: boolean } = {}
): Promise<IGMedia[]> {
  if (!isConfigured) return [];

  const key = `${IG_ID || "me"}-${limit}`;

  if (!options.bypassCache) {
    const cached = await readCache(key);
    if (cached) {
      lastFetchedAt = cached.fetched_at;
      return cached.data;
    }
  }

  const media = await getRecentMedia(limit);
  if (media.length === 0) {
    lastFetchedAt = new Date().toISOString();
    return [];
  }

  const enriched = await Promise.all(
    media.map(async (m) => {
      const ins = await getMediaInsights(m.id, m.media_type);
      return { ...m, ...ins };
    })
  );

  lastFetchedAt = new Date().toISOString();
  await writeCache(key, enriched);
  return enriched;
}

/** Limpa o cache de mídias (usado pelo botão "atualizar agora"). */
export async function clearMediaCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn("[instagram] cache clear failed:", e);
  }
}

/** Diagnóstico — pra UI / status banner. Retorna estado da última chamada. */
export interface IGDiagnostics {
  configured: boolean;
  scheme: Scheme;
  base: string;
  selfPath: string;
  tokenPrefix: string;
  recentErrors: ApiError[];
}

export function getDiagnostics(): IGDiagnostics {
  return {
    configured: isConfigured,
    scheme: SCHEME,
    base: BASE,
    selfPath: SELF_PATH,
    tokenPrefix: TOKEN ? TOKEN.slice(0, 6) + "..." : "(none)",
    recentErrors: getRecentErrors(),
  };
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
  const endpoint = `${SELF_PATH}/insights?metric=reach,impressions,profile_views,follower_count&period=days_28`;
  try {
    const res = await fetch(
      url(`${SELF_PATH}/insights`, {
        metric: "reach,impressions,profile_views,follower_count",
        period: "days_28",
      }),
      { next: { revalidate: 600 } }
    );
    if (!res.ok) {
      logApiError(endpoint, res.status, await res.json().catch(() => null));
      return null;
    }
    const json = await res.json();
    if (json.error) {
      logApiError(endpoint, res.status, json);
      return null;
    }
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
  } catch (e) {
    console.warn("[instagram] getUserInsights threw:", e);
    return null;
  }
}
