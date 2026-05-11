"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuarterOption {
  year: number;
  q: 1 | 2 | 3 | 4;
}

export function QuarterSelect({
  options,
  paramKey = "quarter",
  current,
}: {
  options: QuarterOption[];
  paramKey?: string;
  current: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const value = `${opt.year}-Q${opt.q}`;
        const isActive = current === value;
        const params = new URLSearchParams(searchParams);
        params.set(paramKey, value);
        return (
          <Link
            key={value}
            href={`${pathname}?${params.toString()}`}
            scroll={false}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
            aria-pressed={isActive}
          >
            Q{opt.q} <span className="text-[10px] font-normal opacity-70">{opt.year}</span>
          </Link>
        );
      })}
    </div>
  );
}
