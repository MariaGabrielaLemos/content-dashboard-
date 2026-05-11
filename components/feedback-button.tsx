"use client";

import { useState } from "react";
import { MessageSquare, ThumbsDown, ThumbsUp, Lightbulb, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Sentiment = "positive" | "negative" | "suggestion";

interface Props {
  context: string;
  variant?: "default" | "inline";
}

const SENTIMENT_LABELS: Record<Sentiment, { label: string; icon: typeof ThumbsUp }> = {
  positive: { label: "Aprovado", icon: ThumbsUp },
  negative: { label: "Ajuste necessário", icon: ThumbsDown },
  suggestion: { label: "Sugestão", icon: Lightbulb },
};

export function FeedbackButton({ context, variant = "default" }: Props) {
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
      <Button
        variant={variant === "inline" ? "ghost" : "outline"}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Feedback do Fernando
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-card/80 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            Feedback — <span className="text-muted-foreground font-normal">{context}</span>
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
        placeholder="Comente, aprove ou peça ajuste — o texto vai parar no log de aprendizado da Drop."
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
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Registrar"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
