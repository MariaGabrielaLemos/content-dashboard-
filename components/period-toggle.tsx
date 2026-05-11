"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  hint?: string;
}

export function PeriodToggle({
  options,
  paramKey = "mode",
  defaultValue,
}: {
  options: Option[];
  paramKey?: string;
  defaultValue: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? defaultValue;

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
      {options.map((opt) => {
        const isActive = current === opt.value;
        const params = new URLSearchParams(searchParams);
        params.set(paramKey, opt.value);
        return (
          <Link
            key={opt.value}
            href={`${pathname}?${params.toString()}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
            aria-pressed={isActive}
            scroll={false}
          >
            <span>{opt.label}</span>
            {opt.hint && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">
                {opt.hint}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
