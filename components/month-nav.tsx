"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * Navegação prev/next de mês para o calendário. O mês fica no searchParam
 * `?month=YYYY-MM` (server component lê e busca o histórico correspondente).
 * Pedido do Fernando (feedback 02/06): "como faço para ver meses anteriores?".
 *
 * `next` é desabilitado quando já estamos no mês corrente — não há futuro pra ver.
 */
export function MonthNav({
  year,
  month, // 0-indexed
  paramKey = "month",
}: {
  year: number;
  month: number;
  paramKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  function go(deltaMonths: number) {
    const d = new Date(year, month + deltaMonths, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams);
    params.set(paramKey, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(-1)}
        aria-label="Mês anterior"
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card",
          "text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[120px] text-center text-xs font-medium text-foreground">
        {MONTH_NAMES[month]} {year}
      </span>
      <button
        onClick={() => go(1)}
        aria-label="Próximo mês"
        disabled={isCurrentMonth}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card",
          "text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
