"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (res.ok) {
        setDone(true);
        startTransition(() => router.refresh());
        setTimeout(() => setDone(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={refresh}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : done ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {loading ? "Atualizando…" : done ? "Atualizado" : "Atualizar agora"}
    </Button>
  );
}
