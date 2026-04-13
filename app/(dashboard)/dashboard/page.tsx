import {
  Instagram,
  BarChart3,
  CalendarDays,
  Users,
  Newspaper,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sections = [
  {
    title: "Gerenciador Instagram",
    description: "Agende posts, gerencie DMs e acompanhe o engajamento.",
    href: "/dashboard/instagram",
    icon: Instagram,
    badge: "12 pendentes",
    badgeVariant: "warning" as const,
    stat: "4,2k seguidores",
    trend: "+3,1%",
  },
  {
    title: "Analytics",
    description: "Análise profunda de métricas de desempenho e insights de audiência.",
    href: "/dashboard/analytics",
    icon: BarChart3,
    badge: "Ao vivo",
    badgeVariant: "success" as const,
    stat: "18,4k alcance",
    trend: "+12,5%",
  },
  {
    title: "Calendário de Conteúdo",
    description: "Planeje e agende conteúdo em todos os seus canais.",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    badge: "3 hoje",
    badgeVariant: "secondary" as const,
    stat: "24 agendados",
    trend: "",
  },
  {
    title: "Monitor de Concorrentes",
    description: "Monitore a atividade dos concorrentes e compare seu desempenho.",
    href: "/dashboard/competitors",
    icon: Users,
    badge: "5 monitorados",
    badgeVariant: "outline" as const,
    stat: "Atualizado há 1h",
    trend: "",
  },
  {
    title: "Consolidador de Notícias",
    description: "Agregue e curadorie notícias do setor de múltiplas fontes.",
    href: "/dashboard/news",
    icon: Newspaper,
    badge: "42 novas",
    badgeVariant: "default" as const,
    stat: "8 fontes",
    trend: "",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta. Aqui está uma visão geral do seu hub de conteúdo.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Alcance Total", value: "48,2k", change: "+8,1%" },
          { label: "Taxa de Engajamento", value: "5,4%", change: "+0,6%" },
          { label: "Posts Esta Semana", value: "14", change: "+4" },
          { label: "Concorrentes Monitorados", value: "5", change: "" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.change && (
                  <span className="text-xs text-emerald-400 flex items-center gap-0.5 mb-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de seção */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Seções</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.href}
                className="group hover:border-primary/40 transition-colors duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{section.title}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={section.badgeVariant}>{section.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{section.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {section.stat}
                      {section.trend && (
                        <span className="text-emerald-400 ml-1">
                          {section.trend}
                        </span>
                      )}
                    </span>
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1">
                      <Link href={section.href}>
                        Abrir <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
