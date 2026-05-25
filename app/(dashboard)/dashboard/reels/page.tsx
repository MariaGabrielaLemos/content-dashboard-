import { Film, Play, Eye, Heart, MessageCircle, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { fmtBR } from "@/lib/datetime";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { EvolutionChart, type DailyMetric } from "@/components/evolution-chart";
import { PeriodToggle } from "@/components/period-toggle";
import { RefreshButton } from "@/components/refresh-button";
import {
  getProfile,
  getMediaWithInsights,
  getLastFetchedAt,
  type IGMedia,
} from "@/lib/instagram";

type SortKey = "plays" | "engagement";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function isReel(m: IGMedia): boolean {
  return m.media_type === "VIDEO" || m.media_type === "REELS";
}

export default async function ReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; period?: string }>;
}) {
  const params = await searchParams;
  const sort: SortKey = params.sort === "engagement" ? "engagement" : "plays";
  const period = params.period === "60" ? 60 : params.period === "90" ? 90 : 30;

  const [profile, allMedia] = await Promise.all([
    getProfile(),
    getMediaWithInsights(120),
  ]);

  const now = new Date();
  const since = subDays(now, period);
  const reels = allMedia.filter((m) => isReel(m) && new Date(m.timestamp) >= since);

  const totalPlays = reels.reduce((s, r) => s + (r.views ?? r.plays ?? 0), 0);
  const totalLikes = reels.reduce((s, r) => s + r.like_count, 0);
  const totalComments = reels.reduce((s, r) => s + r.comments_count, 0);
  const totalReach = reels.reduce((s, r) => s + (r.reach ?? 0), 0);
  const avgPlays = reels.length > 0 ? totalPlays / reels.length : 0;
  const followers = profile?.followers_count ?? 0;

  const sortedReels = [...reels].sort((a, b) => {
    if (sort === "engagement") {
      return (
        b.like_count + b.comments_count - (a.like_count + a.comments_count)
      );
    }
    return (b.views ?? b.plays ?? 0) - (a.views ?? a.plays ?? 0);
  });

  // Evolução diária de plays
  const evolutionData: DailyMetric[] = eachDayOfInterval({
    start: since,
    end: now,
  }).map((day) => {
    const dayReels = reels.filter((r) => isSameDay(new Date(r.timestamp), day));
    const plays = dayReels.reduce((s, r) => s + (r.views ?? r.plays ?? 0), 0);
    const eng = dayReels.reduce(
      (s, r) => s + r.like_count + r.comments_count,
      0
    );
    return {
      date: format(day, "yyyy-MM-dd"),
      reach: plays,
      engagement: eng,
    };
  });

  const fetchedAt = getLastFetchedAt();
  const fetchedLabel = fetchedAt
    ? `atualizado ${fmtBR(fetchedAt)}`
    : "Sem dados de coleta";

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Film}
        title="Reels"
        description={
          profile
            ? `@${profile.username} · ${reels.length} reels nos últimos ${period} dias · ${fetchedLabel}`
            : "Conecte a Meta API para puxar dados reais."
        }
        actions={<RefreshButton />}
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 pb-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Período
        </span>
        <PeriodToggle
          paramKey="period"
          defaultValue="30"
          options={[
            { value: "30", label: "30d" },
            { value: "60", label: "60d" },
            { value: "90", label: "90d" },
          ]}
        />
        <span className="ml-4 text-xs uppercase tracking-wider text-muted-foreground">
          Ordenar
        </span>
        <PeriodToggle
          paramKey="sort"
          defaultValue="plays"
          options={[
            { value: "plays", label: "Mais visualizados" },
            { value: "engagement", label: "Mais interagidos" },
          ]}
        />
      </div>

      {reels.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Sem reels neste período"
          description="Ajuste o período acima ou clique em 'Atualizar agora' para forçar novo fetch."
        />
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard
              label="Reels no período"
              icon={Film}
              value={reels.length.toLocaleString("pt-BR")}
              hint={`últimos ${period} dias`}
              accent
            />
            <KpiCard
              label="Plays totais"
              icon={Play}
              value={formatCount(totalPlays)}
              hint={`${totalReach > 0 ? formatCount(totalReach) + " contas alcançadas" : "—"}`}
            />
            <KpiCard
              label="Média de plays/reel"
              icon={Eye}
              value={formatCount(Math.round(avgPlays))}
              hint="por publicação"
            />
            <KpiCard
              label="Engajamento total"
              icon={Heart}
              value={formatCount(totalLikes + totalComments)}
              hint={`${formatCount(totalLikes)} ♥ + ${formatCount(totalComments)} 💬`}
            />
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="mb-3">
                <p className="text-base font-medium">
                  Evolução · plays e engajamento por dia
                </p>
                <p className="text-xs text-muted-foreground">
                  Os reels publicados aparecem no dia de publicação. "Alcance"
                  aqui representa plays.
                </p>
              </div>
              <EvolutionChart
                data={evolutionData}
                labels={{ reach: "Views", engagement: "Engajamento" }}
              />
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {sort === "engagement"
                ? "Top reels — mais interagidos"
                : "Top reels — mais visualizados"}
            </h2>
            <div className="space-y-3">
              {sortedReels.slice(0, 20).map((reel, index) => (
                <ReelRow
                  key={reel.id}
                  reel={reel}
                  rank={index + 1}
                  followers={followers}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ReelRow({
  reel,
  rank,
  followers,
}: {
  reel: IGMedia;
  rank: number;
  followers: number;
}) {
  const engagement = reel.like_count + reel.comments_count;
  const engRate =
    followers > 0 ? ((engagement / followers) * 100).toFixed(2) : null;
  const thumb = reel.thumbnail_url ?? reel.media_url;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
            {rank}
          </div>

          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <Film className="h-full w-full p-5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">Reel</Badge>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {fmtBR(reel.timestamp, "dd/MM/yyyy")}
              </span>
              <Link
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Ver
              </Link>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {reel.caption ?? "(sem legenda)"}
            </p>
          </div>

          <div className="hidden grid-cols-3 gap-3 text-xs sm:grid sm:w-72 sm:shrink-0">
            <div>
              <p className="text-muted-foreground">Views</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCount(reel.views ?? reel.plays ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Engajamento</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCount(engagement)}
              </p>
              {engRate && (
                <p className="text-[10px] text-muted-foreground">{engRate}%</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Comentários</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCount(reel.comments_count)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
