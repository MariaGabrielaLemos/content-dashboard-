import { Newspaper, RefreshCw, BookmarkPlus, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sources = [
  { name: "TechCrunch", category: "Tecnologia", articles: 14, active: true },
  { name: "Marketing Week", category: "Marketing", articles: 9, active: true },
  { name: "Social Media Today", category: "Mídias Sociais", articles: 11, active: true },
  { name: "HubSpot Blog", category: "Marketing", articles: 6, active: true },
  { name: "The Verge", category: "Tecnologia", articles: 18, active: true },
  { name: "Content Marketing Institute", category: "Conteúdo", articles: 4, active: false },
  { name: "Adweek", category: "Publicidade", articles: 7, active: true },
  { name: "Digiday", category: "Mídia Digital", articles: 5, active: true },
];

const articles = [
  {
    title: "Como a IA está reformulando os fluxos de criação de conteúdo em 2026",
    source: "TechCrunch",
    category: "Tecnologia",
    time: "há 2 horas",
    read: false,
    saved: false,
  },
  {
    title: "Nova API de agendamento do Instagram se abre para ferramentas de terceiros",
    source: "Social Media Today",
    category: "Mídias Sociais",
    time: "há 4 horas",
    read: false,
    saved: true,
  },
  {
    title: "O guia definitivo para reaproveitamento de conteúdo em 2026",
    source: "HubSpot Blog",
    category: "Marketing",
    time: "há 6 horas",
    read: true,
    saved: false,
  },
  {
    title: "Vídeos curtos continuam dominando as métricas de engajamento",
    source: "Marketing Week",
    category: "Marketing",
    time: "há 8 horas",
    read: false,
    saved: false,
  },
  {
    title: "Receita da economia criadora atingiu US$250B globalmente no ano passado",
    source: "The Verge",
    category: "Tecnologia",
    time: "há 10 horas",
    read: true,
    saved: true,
  },
  {
    title: "Por que seu calendário de conteúdo precisa de uma revisão trimestral",
    source: "Content Marketing Institute",
    category: "Conteúdo",
    time: "há 1 dia",
    read: true,
    saved: false,
  },
];

const categoryColors: Record<string, string> = {
  Tecnologia: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Marketing: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "Mídias Sociais": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  Conteúdo: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Publicidade: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Mídia Digital": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Consolidador de Notícias</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Agregue e curadorie notícias do setor de múltiplas fontes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Adicionar Fonte
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Feed de artigos */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Artigos Recentes</h2>
            <Badge variant="secondary">42 novos</Badge>
          </div>

          {articles.map((article) => (
            <Card
              key={article.title}
              className={`transition-colors hover:border-primary/30 ${
                article.read ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                          categoryColors[article.category] ??
                          "text-muted-foreground bg-muted border-border"
                        }`}
                      >
                        {article.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{article.source}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{article.time}</span>
                      {article.saved && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          Salvo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-snug">{article.title}</p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <BookmarkPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Painel de fontes */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Fontes</CardTitle>
            <CardDescription>{sources.filter((s) => s.active).length} ativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      source.active ? "bg-emerald-400" : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{source.name}</p>
                    <p className="text-xs text-muted-foreground">{source.category}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {source.articles}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
