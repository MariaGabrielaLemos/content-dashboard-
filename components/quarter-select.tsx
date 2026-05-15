"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(paramKey, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative inline-block">
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-md border border-border bg-card",
          "py-1.5 pl-3 pr-8 text-xs font-medium text-foreground",
          "focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30",
          "cursor-pointer hover:border-border/80"
        )}
      >
        {options.map((opt) => {
          const value = `${opt.year}-Q${opt.q}`;
          return (
            <option key={value} value={value} className="bg-background">
              Q{opt.q} {opt.year}
            </option>
          );
        })}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
