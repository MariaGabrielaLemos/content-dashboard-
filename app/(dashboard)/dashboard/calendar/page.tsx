import {
  CalendarDays,
  Heart,
  MessageCircle,
  Film,
  LayoutGrid,
  Image,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentMedia, IGMedia } from "@/lib/instagram";

const DAYS_HEADER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mediaLabel(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return "Vídeo";
  if (type === "CAROUSEL_ALBUM") return "Carrossel";
  return "Imagem";
}

function mediaIcon(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return <Film className="h-3 w-3" />;
  if (type === "CAROUSEL_ALBUM") return <LayoutGrid className="h-3 w-3" />;
  return <Image className="h-3 w-3" />;
}

function mediaColor(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return "bg-purple-500/20 text-purple-400";
  if (type === "CAROUSEL_ALBUM") return "bg-blue-500/20 text-blue-400";
  return "bg-pink-500/20 text-pink-400";
}

// Retorna o offset do 1º dia do mês (0 = Seg, 6 = Dom)
function getMonthStartOffset(year: number, month: number): number {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Dom,1=Seg...6=Sáb
  return firstDay === 0 ? 6 : firstDay - 1; // converte para Seg=0
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default async function CalendarPage() {
  const media = await getRecentMedia(100);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const today = now.getDate();

  // Posts do mês atual
  const monthPosts = media.filter((m) => {
    const d = new Date(m.timestamp);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Agrupa posts por dia do mês
  const postsByDay: Record<number, IGMedia[]> = {};
  for (const post of monthPosts) {
    const day = new Date(post.timestamp).getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(post);
  }

  const offset = getMonthStartOffset(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const monthName = MONTH_NAMES[currentMonth];

  // Posts do mês ordenados por data
  const monthPostsSorted = [...monthPosts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Calendário de Conteúdo</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Posts publicados no Instagram em {monthName} {currentYear}.
          {monthPosts.length > 0 && (
            <span className="ml-1">{monthPosts.length} post{monthPosts.length !== 1 ? "s" : ""} este mês.</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grade do calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {monthName} {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_HEADER.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Células */}
              <div className="grid grid-cols-7 gap-1">
                {/* Offset do 1º dia */}
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const posts = postsByDay[day] ?? [];
                  const isToday = day === today;

                  return (
                    <div
                      key={day}
                      className={`min-h-[64px] rounded-lg p-1.5 border transition-colors ${
                        isToday
                          ? "border-primary/60 bg-primary/5"
                          : posts.length > 0
                          ? "border-primary/20 bg-muted/40"
                          : "border-transparent bg-muted/20"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday ? "text-primary font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </span>

                      <div className="mt-1 space-y-0.5">
                        {posts.slice(0, 2).map((post) => (
                          <div
                            key={post.id}
                            className={`flex items-center gap-1 rounded px-1 py-0.5 ${mediaColor(post.media_type)}`}
                          >
                            {mediaIcon(post.media_type)}
                            <span className="text-[10px] truncate leading-tight">
                              {new Date(post.timestamp).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                        {posts.length > 2 && (
                          <span className="text-[10px] text-muted-foreground pl-1">
                            +{posts.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-pink-500/30" />
                  <span className="text-xs text-muted-foreground">Imagem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-blue-500/30" />
                  <span className="text-xs text-muted-foreground">Carrossel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-purple-500/30" />
                  <span className="text-xs text-muted-foreground">Vídeo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de posts do mês */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Posts de {monthName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto max-h-[520px]">
            {monthPostsSorted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum post publicado este mês.
              </p>
            ) : (
              monthPostsSorted.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg bg-muted/40 border border-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-2 flex-1">
                      {post.caption ?? "(sem legenda)"}
                    </p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {mediaLabel(post.media_type)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(post.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {formatCount(post.like_count)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      {formatCount(post.comments_count)}
                    </span>
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver post
                    </a>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
