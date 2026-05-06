"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Bell,
  FileBarChart2,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
  {
    label: "Calendário de Conteúdo",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    label: "Relatório Semanal",
    href: "/dashboard/weekly-report",
    icon: FileBarChart2,
  },
  {
    label: "Melhores Posts",
    href: "/dashboard/top-posts",
    icon: Trophy,
  },
];

const bottomNavItems = [
  { label: "Notificações", href: "/dashboard/notifications", icon: Bell },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
              ContentHub
            </span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>

        {/* Main navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            <p className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Principal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-primary" : ""
                        )}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom navigation */}
        <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Separator className="my-2" />
          {/* User avatar area */}
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                Usuário
              </p>
              <p className="text-xs text-muted-foreground truncate">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
