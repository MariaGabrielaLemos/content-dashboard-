/**
 * WBR — utilidades de período + comparativos rolling/estáticos.
 *
 * Requisitos diretos do Fernando (WBR 2026-05-01):
 * - Comparativos rolling: 7d / 30d / 90d
 * - Estáticos por trimestre: Q1 (jan-mar) / Q2 (abr-jun) / Q3 (jul-set) / Q4 (out-dez)
 * - Cada janela rolling traz a janela anterior pra delta (semana atual vs semana anterior, etc.)
 * - "Estáticas e dinâmicas" — toggle entre os dois modos
 */
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfQuarter,
  endOfQuarter,
  setQuarter,
  setYear,
  isWithinInterval,
} from "date-fns";

export type PeriodKind = "rolling-7" | "rolling-30" | "rolling-90" | "quarter";

export interface Period {
  id: string;
  label: string;
  kind: PeriodKind;
  start: Date;
  end: Date;
  /** Janela imediatamente anterior, pra cálculo de delta. */
  previous: { start: Date; end: Date };
}

export function rollingPeriod(days: 7 | 30 | 90, ref: Date = new Date()): Period {
  const end = endOfDay(ref);
  const start = startOfDay(subDays(end, days - 1));
  const prevEnd = endOfDay(subDays(start, 1));
  const prevStart = startOfDay(subDays(prevEnd, days - 1));
  return {
    id: `rolling-${days}`,
    label: `${days} dias`,
    kind: `rolling-${days}` as PeriodKind,
    start,
    end,
    previous: { start: prevStart, end: prevEnd },
  };
}

export function quarterPeriod(year: number, q: 1 | 2 | 3 | 4): Period {
  const ref = setQuarter(setYear(new Date(), year), q);
  const start = startOfQuarter(ref);
  const end = endOfQuarter(ref);
  // Trimestre anterior
  const prevQ = q === 1 ? 4 : ((q - 1) as 1 | 2 | 3 | 4);
  const prevYear = q === 1 ? year - 1 : year;
  const prevRef = setQuarter(setYear(new Date(), prevYear), prevQ);
  const prevStart = startOfQuarter(prevRef);
  const prevEnd = endOfQuarter(prevRef);
  return {
    id: `q${q}-${year}`,
    label: `Q${q} ${year}`,
    kind: "quarter",
    start,
    end,
    previous: { start: prevStart, end: prevEnd },
  };
}

export interface MetricBag {
  posts: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  /** likes + comments + saves + shares */
  engagement: number;
  /** % engajamento médio por post sobre seguidores (0–100) */
  engagementRate: number;
  /** seguidores ao final do período (snapshot) */
  followers: number;
}

export const emptyBag: MetricBag = {
  posts: 0,
  reach: 0,
  impressions: 0,
  likes: 0,
  comments: 0,
  saves: 0,
  shares: 0,
  engagement: 0,
  engagementRate: 0,
  followers: 0,
};

export interface BagWithPrev {
  current: MetricBag;
  previous: MetricBag;
}

export interface DeltaInfo {
  value: number;
  pct: number;
  /** "up" = aumentou, "down" = caiu, "flat" = sem mudança */
  direction: "up" | "down" | "flat";
}

export function delta(current: number, previous: number): DeltaInfo {
  const value = current - previous;
  if (previous === 0 && current === 0) {
    return { value: 0, pct: 0, direction: "flat" };
  }
  const pct = previous === 0 ? 100 : (value / Math.abs(previous)) * 100;
  const direction =
    Math.abs(pct) < 0.5 ? "flat" : pct > 0 ? "up" : "down";
  return { value, pct, direction };
}

/** Métricas onde "ir pra cima" é positivo. Outras (CPA etc.) ficam pra extensão futura. */
const HIGHER_IS_BETTER: (keyof MetricBag)[] = [
  "posts",
  "reach",
  "impressions",
  "likes",
  "comments",
  "saves",
  "shares",
  "engagement",
  "engagementRate",
  "followers",
];

export function isMetricImproving(metric: keyof MetricBag, d: DeltaInfo): boolean | null {
  if (d.direction === "flat") return null;
  const higher = HIGHER_IS_BETTER.includes(metric);
  return higher ? d.direction === "up" : d.direction === "down";
}

/** Aggrega posts dentro de um intervalo. */
export interface PostLike {
  timestamp: string;
  like_count: number;
  comments_count: number;
  saved?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
}

export function aggregatePosts(
  posts: PostLike[],
  interval: { start: Date; end: Date },
  followers: number
): MetricBag {
  const inWindow = posts.filter((p) =>
    isWithinInterval(new Date(p.timestamp), interval)
  );

  const likes = inWindow.reduce((s, p) => s + (p.like_count ?? 0), 0);
  const comments = inWindow.reduce((s, p) => s + (p.comments_count ?? 0), 0);
  const saves = inWindow.reduce((s, p) => s + (p.saved ?? 0), 0);
  const shares = inWindow.reduce((s, p) => s + (p.shares ?? 0), 0);
  const reach = inWindow.reduce((s, p) => s + (p.reach ?? 0), 0);
  const impressions = inWindow.reduce((s, p) => s + (p.impressions ?? 0), 0);
  const engagement = likes + comments + saves + shares;

  const engagementRate =
    inWindow.length > 0 && followers > 0
      ? ((engagement / inWindow.length / followers) * 100)
      : 0;

  return {
    posts: inWindow.length,
    reach,
    impressions,
    likes,
    comments,
    saves,
    shares,
    engagement,
    engagementRate,
    followers,
  };
}

/** Retorna BagWithPrev a partir de uma lista de posts e um Period. */
export function bagForPeriod(
  posts: PostLike[],
  period: Period,
  followers: number
): BagWithPrev {
  const current = aggregatePosts(posts, { start: period.start, end: period.end }, followers);
  const previous = aggregatePosts(posts, period.previous, followers);
  return { current, previous };
}

/** Lista canônica de métricas que entram no comparativo da WBR. */
export const WBR_METRICS: {
  key: keyof MetricBag;
  label: string;
  format: "int" | "pct" | "compact";
}[] = [
  { key: "followers", label: "Seguidores", format: "compact" },
  { key: "reach", label: "Alcance", format: "compact" },
  { key: "impressions", label: "Impressões", format: "compact" },
  { key: "engagement", label: "Engajamento", format: "compact" },
  { key: "engagementRate", label: "Taxa de Engajamento", format: "pct" },
  { key: "likes", label: "Curtidas", format: "compact" },
  { key: "comments", label: "Comentários", format: "compact" },
  { key: "saves", label: "Salvamentos", format: "compact" },
  { key: "shares", label: "Compartilhamentos", format: "compact" },
  { key: "posts", label: "Posts publicados", format: "int" },
];

export function formatMetric(
  value: number,
  format: "int" | "pct" | "compact"
): string {
  if (!Number.isFinite(value)) return "—";
  if (format === "pct") return `${value.toFixed(2)}%`;
  if (format === "int") return Math.round(value).toLocaleString("pt-BR");
  // compact
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toLocaleString("pt-BR");
}

/** Lista de trimestres disponíveis pra dropdown (até o trimestre atual). */
export function availableQuarters(now: Date = new Date()): { year: number; q: 1 | 2 | 3 | 4 }[] {
  const out: { year: number; q: 1 | 2 | 3 | 4 }[] = [];
  const currentYear = now.getFullYear();
  const currentQ = (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  for (let y = currentYear - 1; y <= currentYear; y++) {
    for (let q = 1 as 1 | 2 | 3 | 4; q <= 4; q = (q + 1) as 1 | 2 | 3 | 4) {
      if (y === currentYear && q > currentQ) break;
      out.push({ year: y, q });
    }
  }
  return out.reverse();
}
