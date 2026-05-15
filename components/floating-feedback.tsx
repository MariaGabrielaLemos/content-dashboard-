"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Lightbulb,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Sentiment = "positive" | "negative" | "suggestion";

const SENTIMENT_LABELS: Record<Sentiment, { label: string; icon: typeof ThumbsUp }> = {
  positive: { label: "Aprovado", icon: ThumbsUp },
  negative: { label: "Ajuste necessário", icon: ThumbsDown },
  suggestion: { label: "Sugestão", icon: Lightbulb },
};

const PATH_TO_CONTEXT: Array<[RegExp, string]> = [
  [/^\/dashboard\/wbr/, "WBR Comparativos"],
  [/^\/dashboard\/projection/, "Projetado vs Realizado"],
  [/^\/dashboard\/top-posts/, "Melhores posts"],
  [/^\/dashboard\/reels/, "Reels"],
  [/^\/dashboard\/calendar/, "Calendário"],
  [/^\/dashboard\/instagram/, "Gerenciador Instagram"],
  [/^\/dashboard\/feedback/, "Feedback (issues)"],
  [/^\/dashboard\/analytics/, "Analytics"],
  [/^\/dashboard\/?$/, "Painel executivo"],
];

function contextFromPath(pathname: string): string {
  for (const [re, label] of PATH_TO_CONTEXT) {
    if (re.test(pathname)) return label;
  }
  return pathname.replace(/^\//, "");
}

export function FloatingFeedback() {
  const pathname = usePathname();
  const context = useMemo(() => contextFromPath(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment>("suggestion");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, sentiment, message: text.trim() }),
      });
      if (res.ok) {
        setDone(true);
        setText("");
        setTimeout(() => {
          setOpen(false);
          setDone(false);
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Dar feedback sobre esta página"
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "inline-flex items-center gap-2 rounded-full",
          "border border-primary/40 bg-primary/15 px-4 py-2.5",
          "text-sm font-medium text-primary shadow-lg backdrop-blur",
          "transition-all hover:bg-primary/25 hover:shadow-xl"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))]",
        "rounded-xl border border-primary/30 bg-card/95 p-4",
        "shadow-2xl backdrop-blur"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            Feedback —{" "}
            <span className="font-normal text-muted-foreground">{context}</span>
          </span>
        </div>
        <button
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.entries(SENTIMENT_LABELS) as [Sentiment, typeof SENTIMENT_LABELS["positive"]][]).map(
          ([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setSentiment(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                sentiment === key
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          )
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Comente, aprove ou peça ajuste. Vai entrar na fila de issues da dashboard."
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Registrado
          </span>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={submit} disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Registrar"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
