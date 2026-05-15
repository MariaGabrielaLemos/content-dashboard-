"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  CalendarDays,
  Activity,
  FileBarChart2,
  Trophy,
  Target,
  MessageSquare,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const primaryNav = [
  {
    label: "Painel",
    href: "/dashboard",
    icon: Activity,
    section: "Visão executiva",
  },
  {
    label: "WBR · Comparativos",
    href: "/dashboard/wbr",
    icon: FileBarChart2,
    badge: "Core",
  },
  {
    label: "Projetado vs Realizado",
    href: "/dashboard/projection",
    icon: Target,
  },
];

const operacionalNav = [
  {
    label: "Melhores posts (6m)",
    href: "/dashboard/top-posts",
    icon: Trophy,
  },
  {
    label: "Reels",
    href: "/dashboard/reels",
    icon: Film,
  },
  {
    label: "Calendário do mês",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    label: "Gerenciador Instagram",
    href: "/dashboard/instagram",
    icon: Instagram,
  },
  {
    label: "Feedback (issues)",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-orange-500 to-orange-700 shadow-md shadow-primary/20">
          <span className="text-sm font-bold tracking-wide text-white">FM</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-tight text-sidebar-foreground">
            Fernando Moulin
          </span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            WBR · Drop Studios
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <NavSection label="Visão executiva" items={primaryNav} pathname={pathname} />
        <div className="my-4 px-2">
          <Separator />
        </div>
        <NavSection label="Operacional" items={operacionalNav} pathname={pathname} />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Substitui o
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">MLABS</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground/85">
            Rolling + trimestres · feedback persistido · puxa direto da Meta API
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { label: string; href: string; icon: typeof Activity; badge?: string }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
        {label}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // touch target 44px (min-h-11 = 2.75rem = 44px)
                "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-all",
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-primary"
                />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/80 group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
