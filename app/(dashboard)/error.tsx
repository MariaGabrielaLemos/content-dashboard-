"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary do route group (dashboard).
 *
 * Por que existe: antes, um erro no render server-side de qualquer página
 * (ex: ENOENT em data/goals.json na página Projetado vs Realizado) derrubava
 * a tela inteira com a mensagem genérica do Next ("couldn't load"). Aqui a
 * falha fica contida numa página e o usuário tem um botão de tentar de novo.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Não consegui carregar esta seção</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Algo falhou ao montar os dados desta página. As outras seções continuam
          funcionando — tente recarregar aqui.
        </p>
        {error.digest && (
          <p className="text-[11px] text-muted-foreground/60">ref: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Tentar de novo
      </Button>
    </div>
  );
}
