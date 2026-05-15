import { MessageSquare, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { FeedbackStatusSelect } from "@/components/feedback-status-select";
import { listFeedback, type Feedback } from "@/lib/feedback-store";

const SENTIMENT_META = {
  positive: {
    label: "Aprovado",
    icon: ThumbsUp,
    classes: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  },
  negative: {
    label: "Ajuste necessário",
    icon: ThumbsDown,
    classes: "border-rose-500/30 bg-rose-500/5 text-rose-300",
  },
  suggestion: {
    label: "Sugestão",
    icon: Lightbulb,
    classes: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  },
} as const;

export default async function FeedbackPage() {
  const items = await listFeedback();

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={MessageSquare}
        title="Backlog de feedback"
        description="Fila de issues da própria dashboard. Cada feedback do Fernando vira um item rastreável — mude o status conforme implementação."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(["positive", "negative", "suggestion"] as const).map((s) => {
          const m = SENTIMENT_META[s];
          const count = items.filter((i) => i.sentiment === s).length;
          const Icon = m.icon;
          return (
            <Card key={s} className={m.classes}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    {m.label}
                  </p>
                  <Icon className="h-4 w-4 opacity-80" />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sem feedbacks ainda"
          description="Quando o Fernando registrar feedback nas seções, aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ item }: { item: Feedback }) {
  const meta = SENTIMENT_META[item.sentiment];
  const Icon = meta.icon;
  return (
    <Card className={meta.classes}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="text-[10px]">
                {meta.label}
              </Badge>
              <span className="text-muted-foreground">{item.context}</span>
              <span className="text-muted-foreground/70">·</span>
              <span className="text-muted-foreground">
                {format(parseISO(item.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
              <span className="ml-auto">
                <FeedbackStatusSelect id={item.id} status={item.status} />
              </span>
            </div>
            <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
              {item.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
