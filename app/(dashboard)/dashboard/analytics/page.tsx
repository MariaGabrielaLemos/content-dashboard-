import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kpis = [
  {
    label: "Alcance Total",
    value: "48.214",
    change: "+8,1%",
    up: true,
    icon: Eye,
  },
  {
    label: "Taxa de Engajamento",
    value: "5,4%",
    change: "+0,6%",
    up: true,
    icon: Activity,
  },
  {
    label: "Visitas ao Perfil",
    value: "3.102",
    change: "-1,2%",
    up: false,
    icon: Users,
  },
  {
    label: "Cliques no Link",
    value: "874",
    change: "+14,3%",
    up: true,
    icon: MousePointerClick,
  },
];

const topContent = [
  { title: "Reel de lançamento de produto", type: "Reel", reach: "12,4k", engagement: "8,2%" },
  { title: "Story de bastidores", type: "Story", reach: "8,1k", engagement: "6,5%" },
  { title: "Carrossel de depoimentos de clientes", type: "Carrossel", reach: "6,9k", engagement: "7,1%" },
  { title: "Post de destaque da equipe", type: "Post", reach: "5,3k", engagement: "4,8%" },
  { title: "Anúncio de novo blog", type: "Post", reach: "4,7k", engagement: "3,9%" },
];

const audienceData = [
  { label: "18–24", percent: 22 },
  { label: "25–34", percent: 38 },
  { label: "35–44", percent: 24 },
  { label: "45–54", percent: 11 },
  { label: "55+", percent: 5 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Métricas de desempenho e insights de audiência em todos os seus canais.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{kpi.value}</span>
                  <span
                    className={`text-xs flex items-center gap-0.5 mb-0.5 ${
                      kpi.up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {kpi.up ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conteúdo de destaque */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conteúdo de Melhor Desempenho</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContent.map((item, i) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-5 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.reach} alcance</p>
                    </div>
                    <Badge variant="secondary">{item.type}</Badge>
                    <span className="text-sm font-semibold text-emerald-400 w-12 text-right">
                      {item.engagement}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Faixa etária */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faixa Etária da Audiência</CardTitle>
            <CardDescription>Dados demográficos dos seguidores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {audienceData.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{group.label}</span>
                  <span className="font-medium">{group.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${group.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
