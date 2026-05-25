export const dynamic = "force-dynamic";

import {
  FileBarChart2,
  Target,
  Trophy,
  CalendarDays,
  Instagram,
  ArrowUpRight,
  Users,
  Eye,
  Heart,
  Activity,
  Bookmark,
  Send,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import { fmtBR } from "@/lib/datetime";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { EvolutionChart, type DailyMetric } from "@/components/evolution-chart";
import { RefreshButton } from "@/components/refresh-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getProfile, getMediaWithInsights, getLastFetchedAt } from "@/lib/instagram";
import {
  rollingPeriod,
  bagForPeriod,
  delta as calcDelta,
  formatMetric,
} from "@/lib/wbr";

export default async function OverviewPage() {
  // Painel mostra 7d + delta vs 7d anterior + evolução 30d.
  // Janela mínima: 30d. Margem 2x (60d) pra cobrir delta sem cortar bordas.
  const sinceDate = subDays(new Date(), 60);
  const [profile, media] = await Promise.all([
    getProfile(),
    getMediaWithInsights({ sinceDate }),
  ]);

  const followers = profile?.followers_count ?? 0;
  const now = new Date();
  const fetchedAt = getLastFetchedAt();
  const fetchedLabel = fetchedAt
    ? `Atualizado ${fmtBR(fetchedAt)}`
    : `Carregado em ${fmtBR(now)}`;

  const week = rollingPeriod(7, now);
  const month = rollingPeriod(30, now);
  const weekBag = bagForPeriod(media, week, followers);
  const monthBag = bagForPeriod(media, month, followers);

  // Evolução 30d
  const evolutionData: DailyMetric[] = eachDayOfInterval({
    start: subDays(now, 29),
    end: now,
  }).map((day) => {
    const dayPosts = media.filter((m) => isSameDay(new Date(m.timestamp), day));
    const reach = dayPosts.reduce((s, p) => s + (p.reach ?? 0), 0);
    const likes = dayPosts.reduce((s, p) => s + p.like_count, 0);
    const comments = dayPosts.reduce((s, p) => s + p.comments_count, 0);
    return {
      date: format(day, "yyyy-MM-dd"),
      reach,
      engagement: likes + comments,
    };
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Activity}
        title={
          profile
            ? `Painel — @${profile.username}`
            : "Painel — WBR Fernando Moulin"
        }
        description={`Resumo executivo dos últimos 7 dias. ${
          profile ? `${followers.toLocaleString("pt-BR")} seguidores hoje.` : "Conecte a Meta API para puxar dados reais."
        }`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
              {fetchedLabel}
            </Badge>
            <RefreshButton />
          </div>
        }
      />

      {/* KPIs principais */}
      {media.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sem dados da Meta API"
          description="Configure as credenciais em .env.local para puxar métricas reais. Os dados antigos do MLABS ficam fora — esta dashboard substitui aquele fluxo."
        />
      ) : (
        <div className="space-y-4">
        <div className="kpi-grid">
          <KpiCard
            label="Seguidores"
            icon={Users}
            value={followers.toLocaleString("pt-BR")}
            hint="Total na conta hoje"
            accent
          />
          <KpiCard
            label="Alcance · 7d"
            icon={Eye}
            value={formatMetric(weekBag.current.reach, "compact")}
            delta={calcDelta(weekBag.current.reach, weekBag.previous.reach)}
            compareValue={formatMetric(weekBag.previous.reach, "compact")}
          />
          <KpiCard
            label="Engajamento · 7d"
            icon={Heart}
            value={formatMetric(weekBag.current.engagement, "compact")}
            delta={calcDelta(weekBag.current.engagement, weekBag.previous.engagement)}
            compareValue={formatMetric(weekBag.previous.engagement, "compact")}
          />
          <KpiCard
            label="Taxa de Engajamento · 7d"
            icon={Activity}
            value={formatMetric(weekBag.current.engagementRate, "pct")}
            delta={calcDelta(weekBag.current.engagementRate, weekBag.previous.engagementRate)}
            compareValue={formatMetric(weekBag.previous.engagementRate, "pct")}
            hint={`${weekBag.current.posts} posts publicados`}
          />
        </div>

        {/* Eyebrow + linha 2 — sinais de qualidade + volume (tier signal) */}
        <div className="space-y-3 pt-2">
          <p className="eyebrow">Sinais estratégicos · 7d</p>
          <div className="kpi-grid">
            <KpiCard
              tier="signal"
              label="Views"
              icon={PlayCircle}
              value={formatMetric(weekBag.current.views, "compact")}
              delta={calcDelta(weekBag.current.views, weekBag.previous.views)}
              compareValue={formatMetric(weekBag.previous.views, "compact")}
              hint="Topo de funil — visualizações totais"
            />
            <KpiCard
              tier="signal"
              label="Salvamentos"
              icon={Bookmark}
              value={formatMetric(weekBag.current.saves, "compact")}
              delta={calcDelta(weekBag.current.saves, weekBag.previous.saves)}
              compareValue={formatMetric(weekBag.previous.saves, "compact")}
              hint="High intent — guardado pra rever"
            />
            <KpiCard
              tier="signal"
              label="Compartilhamentos"
              icon={Send}
              value={formatMetric(weekBag.current.shares, "compact")}
              delta={calcDelta(weekBag.current.shares, weekBag.previous.shares)}
              compareValue={formatMetric(weekBag.previous.shares, "compact")}
              hint="Algoritmo prioriza — viralidade orgânica"
            />
            <KpiCard
              tier="signal"
              label="Posts publicados"
              icon={FileBarChart2}
              value={formatMetric(weekBag.current.posts, "int")}
              delta={calcDelta(weekBag.current.posts, weekBag.previous.posts)}
              compareValue={formatMetric(weekBag.previous.posts, "int")}
              hint="Cadência editorial"
            />
          </div>
        </div>
        </div>
      )}

      {/* Evolução 30d + acessos rápidos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {media.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolução · 30 dias</CardTitle>
                <CardDescription>
                  Alcance e engajamento por dia de publicação. Use a página WBR pra leitura completa de comparativos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvolutionChart data={evolutionData} />

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Posts no período</p>
                    <p className="text-base font-semibold tabular-nums">
                      {monthBag.current.posts}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Alcance total · 30d</p>
                    <p className="text-base font-semibold tabular-nums">
                      {formatMetric(monthBag.current.reach, "compact")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engajamento · 30d</p>
                    <p className="text-base font-semibold tabular-nums">
                      {formatMetric(monthBag.current.engagement, "compact")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acesso rápido</CardTitle>
            <CardDescription>Onde a Maria abre primeiro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink
              href="/dashboard/wbr"
              icon={FileBarChart2}
              title="WBR · Comparativos"
              hint="Rolling 7/30/90 + Trimestres"
            />
            <QuickLink
              href="/dashboard/projection"
              icon={Target}
              title="Projetado vs Realizado"
              hint="Metas trimestrais e mensais"
            />
            <QuickLink
              href="/dashboard/top-posts"
              icon={Trophy}
              title="Melhores posts (6 meses)"
              hint="Ranking + análise por post"
            />
            <QuickLink
              href="/dashboard/calendar"
              icon={CalendarDays}
              title="Calendário do mês"
              hint="Posts já publicados"
            />
            <QuickLink
              href="/dashboard/instagram"
              icon={Instagram}
              title="Gerenciador Instagram"
              hint="Feed bruto da conta"
            />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon: typeof Activity;
  title: string;
  hint: string;
}) {
  return (
    <Button
      variant="ghost"
      asChild
      className="h-auto w-full justify-start px-3 py-2.5 text-left hover:bg-muted/40"
    >
      <Link href={href} className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Link>
    </Button>
  );
}
