import { FileBarChart2, Calendar } from "lucide-react";
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SectionHeader } from "@/components/section-header";
import { WbrComparisonTable } from "@/components/wbr-comparison-table";
import { WeeklySummary } from "@/components/weekly-summary";
import { EvolutionChart, type DailyMetric } from "@/components/evolution-chart";
import { PeriodToggle } from "@/components/period-toggle";
import { QuarterSelect } from "@/components/quarter-select";
import { RefreshButton } from "@/components/refresh-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { getProfile, getMediaWithInsights, getLastFetchedAt } from "@/lib/instagram";
import {
  rollingPeriod,
  quarterPeriod,
  bagForPeriod,
  availableQuarters,
  type Period,
  type BagWithPrev,
} from "@/lib/wbr";

type Mode = "rolling" | "quarter";

export default async function WbrPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; quarter?: string }>;
}) {
  const params = await searchParams;
  const mode: Mode = params.mode === "quarter" ? "quarter" : "rolling";

  const [profile, allMedia] = await Promise.all([
    getProfile(),
    getMediaWithInsights(120),
  ]);

  const followers = profile?.followers_count ?? 0;
  const now = new Date();
  const fetchedAt = getLastFetchedAt();
  const fetchedLabel = fetchedAt
    ? `atualizado ${format(parseISO(fetchedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
    : `carregado em ${format(now, "dd/MM 'às' HH:mm", { locale: ptBR })}`;

  // ---------------- Comparativo principal ----------------
  let comparisonColumns: { period: Period; bag: BagWithPrev }[] = [];
  let mainPeriod: Period | null = null;

  if (mode === "rolling") {
    const periods: Period[] = [
      rollingPeriod(7, now),
      rollingPeriod(30, now),
      rollingPeriod(90, now),
    ];
    comparisonColumns = periods.map((p) => ({
      period: p,
      bag: bagForPeriod(allMedia, p, followers),
    }));
    mainPeriod = periods[0];
  } else {
    const quarters = availableQuarters(now);
    const selected = params.quarter ?? `${quarters[0].year}-Q${quarters[0].q}`;
    const [yStr, qStr] = selected.split("-Q");
    const y = Number(yStr);
    const q = Number(qStr) as 1 | 2 | 3 | 4;
    const period = quarterPeriod(y, q);
    comparisonColumns = [{ period, bag: bagForPeriod(allMedia, period, followers) }];
    mainPeriod = period;
  }

  // Resumo semanal sempre é a última semana (gatilho operacional da WBR)
  const lastWeekPeriod = rollingPeriod(7, now);
  const lastWeekBag = bagForPeriod(allMedia, lastWeekPeriod, followers);

  // ---------------- Série de evolução 30d ----------------
  const evolutionData: DailyMetric[] = eachDayOfInterval({
    start: subDays(now, 29),
    end: now,
  }).map((day) => {
    const dayPosts = allMedia.filter((m) =>
      isSameDay(new Date(m.timestamp), day)
    );
    const reach = dayPosts.reduce((s, p) => s + (p.reach ?? 0), 0);
    const likes = dayPosts.reduce((s, p) => s + p.like_count, 0);
    const comments = dayPosts.reduce((s, p) => s + p.comments_count, 0);
    const saves = dayPosts.reduce((s, p) => s + (p.saved ?? 0), 0);
    const shares = dayPosts.reduce((s, p) => s + (p.shares ?? 0), 0);
    return {
      date: format(day, "yyyy-MM-dd"),
      reach,
      engagement: likes + comments + saves + shares,
    };
  });

  const quarters = availableQuarters(now);
  const selectedQuarter =
    params.quarter ?? `${quarters[0].year}-Q${quarters[0].q}`;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={FileBarChart2}
        title="WBR — Weekly Business Review"
        description={
          profile
            ? `@${profile.username} · ${followers.toLocaleString("pt-BR")} seguidores · ${fetchedLabel}`
            : "Comparativos rolling 7/30/90 dias e estáticos por trimestre — substitui a leitura manual no MLABS."
        }
        actions={<RefreshButton />}
      />

      {/* Toggle de modo */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Análise
          </span>
          <PeriodToggle
            paramKey="mode"
            defaultValue="rolling"
            options={[
              { value: "rolling", label: "Rolling", hint: "(dinâmico)" },
              { value: "quarter", label: "Trimestre", hint: "(estático)" },
            ]}
          />
        </div>
        {mode === "quarter" && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <QuarterSelect
              options={quarters}
              current={selectedQuarter}
            />
          </div>
        )}
      </div>

      {/* Resumo semanal */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Resumo da última semana
        </h2>
        {allMedia.length === 0 ? (
          <EmptyState
            title="Sem dados da Meta API"
            description="Configure INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID em .env.local para puxar métricas reais."
          />
        ) : (
          <WeeklySummary bag={lastWeekBag} />
        )}
      </section>

      {/* Evolução 30 dias */}
      {allMedia.length > 0 && (
        <section className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução — últimos 30 dias</CardTitle>
              <CardDescription>
                Alcance e engajamento agregados por dia de publicação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvolutionChart data={evolutionData} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Comparativo */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {mode === "rolling"
            ? "Comparativos rolling (7/30/90 dias)"
            : `Trimestre fixo · ${mainPeriod?.label}`}
        </h2>
        {comparisonColumns.length === 0 || allMedia.length === 0 ? (
          <EmptyState
            title="Comparativo indisponível"
            description="Conecte a Meta API ou aguarde dados do trimestre anterior."
          />
        ) : (
          <WbrComparisonTable
            columns={comparisonColumns}
            description={
              mode === "rolling"
                ? "Cada coluna mostra a métrica acumulada na janela e o delta vs janela anterior. Janelas se deslocam dia a dia."
                : "Comparação fechada: trimestre selecionado vs trimestre anterior. Use para fechar Q1, Q2, Q3, Q4."
            }
          />
        )}
      </section>

    </div>
  );
}
