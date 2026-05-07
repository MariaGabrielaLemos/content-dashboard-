"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart3,
  CalendarDays,
  Activity,
  FileBarChart2,
  Trophy,
  Target,
  MessageSquare,
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
  {
    label: "Feedback do Fernando",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
];

const operacionalNav = [
  {
    label: "Melhores posts (6m)",
    href: "/dashboard/top-posts",
    icon: Trophy,
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
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-orange-500 to-orange-700">
          <span className="text-sm font-bold text-white">FM</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
            Fernando Moulin
          </span>
          <span className="text-[11px] text-muted-foreground">
            WBR Dashboard · Drop Studios
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <NavSection label="Visão executiva" items={primaryNav} pathname={pathname} />
        <div className="my-3 px-2">
          <Separator />
        </div>
        <NavSection label="Operacional" items={operacionalNav} pathname={pathname} />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
        <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Substitui o
          </p>
          <p className="text-xs font-medium text-foreground">MLABS</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Comparativos rolling + trimestres fixos · feedback persistido
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
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </p>
      <nav className="space-y-1">
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
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  {item.badge}
                </span>
              )}
              {isActive && !item.badge && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
