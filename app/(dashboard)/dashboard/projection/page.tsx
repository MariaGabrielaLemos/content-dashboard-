import { Target, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { differenceInDays, format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectionChart, type ProjectionPoint } from "@/components/projection-chart";
import { FeedbackButton } from "@/components/feedback-button";
import { EmptyState } from "@/components/empty-state";
import { getProfile, getRecentMedia } from "@/lib/instagram";
import { listGoals } from "@/lib/projection-store";
import { GoalForm } from "./goal-form";

type GoalMetric = "followers" | "reach" | "engagement";

const METRIC_LABEL: Record<GoalMetric, string> = {
  followers: "Seguidores",
  reach: "Alcance acumulado (mensal)",
  engagement: "Engajamento acumulado (mensal)",
};

export default async function ProjectionPage() {
  const [profile, media, goals] = await Promise.all([
    getProfile(),
    getRecentMedia(50),
    listGoals(),
  ]);

  const followers = profile?.followers_count ?? 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Target}
        title="Projetado vs Realizado"
        description="Defina metas trimestrais ou mensais. A linha tracejada é o caminho projetado; a área cheia é o realizado puxado da Meta API."
        actions={<FeedbackButton context="Projeção" />}
      />

      <GoalForm currentFollowers={followers} />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada ainda"
          description="Crie a primeira meta no formulário acima — ex: 5.000 seguidores até 30/06."
        />
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const today = new Date();
            const baselineDate = new Date(goal.baselineDate);
            const deadline = new Date(goal.deadline);
            const totalDays = Math.max(differenceInDays(deadline, baselineDate), 1);
            const elapsed = Math.min(
              Math.max(differenceInDays(today, baselineDate), 0),
              totalDays
            );

            // Valor atual (só temos seguidores em tempo real). Outras métricas: usar baseline + crescimento estimado.
            // Quando a API não retorna dados, ficamos honestos: not enough data → null.
            let currentValue: number | null;
            if (goal.metric === "followers") {
              currentValue = followers > 0 ? followers : null;
            } else if (goal.metric === "engagement" && media.length > 0) {
              const eng = media.reduce(
                (s, m) => s + m.like_count + m.comments_count,
                0
              );
              currentValue = goal.baseline + eng;
            } else {
              currentValue = null;
            }
            const apiReady = currentValue !== null;
            const realizedDeltaSafe = apiReady && currentValue != null ? currentValue - goal.baseline : 0;

            const targetDelta = goal.target - goal.baseline;
            const expectedNow = goal.baseline + (targetDelta * elapsed) / totalDays;
            const onTrackDelta = apiReady
              ? realizedDeltaSafe - (expectedNow - goal.baseline)
              : 0;
            const onTrack = onTrackDelta >= 0;
            const progressPct = apiReady
              ? Math.min(
                  Math.max(((currentValue! - goal.baseline) / Math.max(targetDelta, 1)) * 100, 0),
                  999
                )
              : 0;

            // Build chart series: linha projetada (linear baseline → target) + actual (até hoje)
            const data: ProjectionPoint[] = [];
            for (let i = 0; i <= totalDays; i++) {
              const d = addDays(baselineDate, i);
              const target = goal.baseline + (targetDelta * i) / totalDays;
              const isPast = differenceInDays(today, d) >= 0;
              const actual =
                apiReady && isPast
                  ? goal.baseline +
                    (realizedDeltaSafe * Math.min(i, elapsed)) / Math.max(elapsed, 1)
                  : null;
              data.push({
                date: format(d, "yyyy-MM-dd"),
                target,
                actual,
              });
            }

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {METRIC_LABEL[goal.metric as GoalMetric]}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Meta: {goal.target.toLocaleString("pt-BR")} até{" "}
                        {format(deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} ·
                        baseline {goal.baseline.toLocaleString("pt-BR")} em{" "}
                        {format(baselineDate, "dd/MM/yyyy")}
                      </CardDescription>
                      {goal.note && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {goal.note}
                        </p>
                      )}
                    </div>
                    {apiReady ? (
                      <Badge
                        variant={onTrack ? "success" : "destructive"}
                        className="gap-1.5"
                      >
                        {onTrack ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {onTrack ? "No ritmo" : "Abaixo do ritmo"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        Aguardando Meta API
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Stat
                      label="Realizado"
                      value={apiReady ? currentValue!.toLocaleString("pt-BR") : "—"}
                      hint={apiReady ? `${progressPct.toFixed(1)}% da meta` : "sem dado da API ainda"}
                    />
                    <Stat
                      label="Projetado para hoje"
                      value={Math.round(expectedNow).toLocaleString("pt-BR")}
                      hint={`Dia ${elapsed} de ${totalDays}`}
                    />
                    <Stat
                      label="Diferença vs ritmo"
                      value={
                        apiReady
                          ? `${onTrackDelta >= 0 ? "+" : ""}${Math.round(onTrackDelta).toLocaleString("pt-BR")}`
                          : "—"
                      }
                      hint={
                        apiReady
                          ? onTrack
                            ? "Acima do esperado"
                            : "Atrás do esperado"
                          : "conecte token Meta"
                      }
                      tone={apiReady ? (onTrack ? "good" : "bad") : "neutral"}
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  <ProjectionChart data={data} />

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {totalDays - elapsed > 0
                        ? `${totalDays - elapsed} dias restantes`
                        : "Prazo encerrado"}
                    </span>
                    <span>id: {goal.id}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
      ? "text-rose-300"
      : "text-foreground";
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
