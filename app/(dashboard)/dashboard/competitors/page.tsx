import { Users, TrendingUp, TrendingDown, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const competitors = [
  {
    name: "BrandAlpha",
    handle: "@brandalpha",
    followers: "128,4k",
    followerChange: "+2,3%",
    up: true,
    engagementRate: "4,1%",
    postsPerWeek: 6,
    lastPost: "há 2 horas",
    trend: "growing",
  },
  {
    name: "ContentCo",
    handle: "@contentco",
    followers: "84,2k",
    followerChange: "+0,8%",
    up: true,
    engagementRate: "3,8%",
    postsPerWeek: 4,
    lastPost: "há 5 horas",
    trend: "stable",
  },
  {
    name: "MediaHub",
    handle: "@mediahub",
    followers: "211,7k",
    followerChange: "-0,5%",
    up: false,
    engagementRate: "2,9%",
    postsPerWeek: 8,
    lastPost: "há 1 dia",
    trend: "declining",
  },
  {
    name: "ViralPosts",
    handle: "@viralposts",
    followers: "52,1k",
    followerChange: "+5,7%",
    up: true,
    engagementRate: "7,2%",
    postsPerWeek: 10,
    lastPost: "há 30 minutos",
    trend: "growing",
  },
  {
    name: "StudioXYZ",
    handle: "@studioxy",
    followers: "39,8k",
    followerChange: "+1,1%",
    up: true,
    engagementRate: "5,5%",
    postsPerWeek: 3,
    lastPost: "há 3 dias",
    trend: "stable",
  },
];

const trendBadge: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  growing: { label: "Crescendo", variant: "success" },
  stable: { label: "Estável", variant: "warning" },
  declining: { label: "Declinando", variant: "destructive" },
};

export default function CompetitorsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Monitor de Concorrentes</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Monitore a atividade dos concorrentes e compare seu desempenho.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Concorrente
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Contas Monitoradas
            </p>
            <p className="text-2xl font-bold mt-2">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Engajamento Médio (Concorrentes)
            </p>
            <p className="text-2xl font-bold mt-2">4,7%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Seu Engajamento vs. Média
            </p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-2xl font-bold">5,4%</p>
              <span className="text-xs text-emerald-400 flex items-center gap-0.5 mb-0.5">
                <TrendingUp className="h-3 w-3" />
                +0,7% acima
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de concorrentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Concorrentes Monitorados</CardTitle>
          <CardDescription>Atualizado há 1 hora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-6 gap-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="col-span-2">Conta</span>
              <span>Seguidores</span>
              <span>Engajamento</span>
              <span>Posts/sem</span>
              <span>Tendência</span>
            </div>

            {competitors.map((c) => {
              const tb = trendBadge[c.trend];
              return (
                <div
                  key={c.handle}
                  className="grid grid-cols-6 gap-4 items-center px-4 py-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                >
                  {/* Conta */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {c.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.handle}</p>
                    </div>
                  </div>

                  {/* Seguidores */}
                  <div>
                    <p className="text-sm font-medium">{c.followers}</p>
                    <p
                      className={`text-xs flex items-center gap-0.5 ${
                        c.up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {c.up ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {c.followerChange}
                    </p>
                  </div>

                  {/* Engajamento */}
                  <p className="text-sm font-medium">{c.engagementRate}</p>

                  {/* Posts/sem */}
                  <p className="text-sm text-muted-foreground">{c.postsPerWeek}×</p>

                  {/* Tendência */}
                  <div className="flex items-center gap-2">
                    <Badge variant={tb.variant}>{tb.label}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
