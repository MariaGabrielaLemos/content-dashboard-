import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/40 pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/25"
            >
              <Icon className="h-[18px] w-[18px] text-primary" />
            </span>
          )}
          <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-strong">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {actions}
        </div>
      )}
    </header>
  );
}
