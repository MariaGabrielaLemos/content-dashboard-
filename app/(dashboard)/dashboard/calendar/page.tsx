import type { ElementType } from "react";
import { CalendarDays, Plus, Instagram, Twitter, Youtube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const scheduledPosts: Record<number, { title: string; platform: string; time: string; type: string }[]> = {
  1: [{ title: "Reel teaser de produto", platform: "Instagram", time: "09:00", type: "Reel" }],
  3: [
    { title: "Compartilhamento de post do blog", platform: "Twitter", time: "11:00", type: "Post" },
    { title: "Vídeo tutorial", platform: "YouTube", time: "15:00", type: "Vídeo" },
  ],
  5: [{ title: "Sorteio de fim de semana", platform: "Instagram", time: "12:00", type: "Carrossel" }],
  7: [{ title: "Citação motivacional", platform: "Instagram", time: "08:00", type: "Story" }],
  10: [{ title: "Thread de estudo de caso", platform: "Twitter", time: "10:00", type: "Thread" }],
  12: [{ title: "Showcase de produto", platform: "Instagram", time: "14:00", type: "Post" }],
  14: [{ title: "Perguntas & Respostas da Comunidade", platform: "Instagram", time: "18:00", type: "Live" }],
};

const platformIcon: Record<string, ElementType> = {
  Instagram,
  Twitter,
  YouTube: Youtube,
};

const platformColor: Record<string, string> = {
  Instagram: "text-pink-400",
  Twitter: "text-sky-400",
  YouTube: "text-red-400",
};

const upcomingPosts = [
  { title: "Reel teaser de produto", platform: "Instagram", date: "Seg, 7 Abr", time: "09:00" },
  { title: "Compartilhamento de post do blog", platform: "Twitter", date: "Qua, 9 Abr", time: "11:00" },
  { title: "Vídeo tutorial", platform: "YouTube", date: "Qua, 9 Abr", time: "15:00" },
  { title: "Sorteio de fim de semana", platform: "Instagram", date: "Sex, 11 Abr", time: "12:00" },
  { title: "Citação motivacional", platform: "Instagram", date: "Dom, 13 Abr", time: "08:00" },
];

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Calendário de Conteúdo</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Planeje e agende conteúdo em todos os seus canais.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agendar Post
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grade do calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Abril 2026</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">&lt;</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">&gt;</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Células dos dias — 5 semanas */}
              <div className="grid grid-cols-7 gap-1">
                {/* Abril 2026 começa na quarta-feira (offset 2) */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const posts = scheduledPosts[day] ?? [];
                  const isToday = day === 9;
                  return (
                    <div
                      key={day}
                      className={`min-h-[64px] rounded-lg p-1.5 border transition-colors cursor-pointer hover:border-primary/40 ${
                        isToday
                          ? "border-primary/60 bg-primary/5"
                          : "border-transparent bg-muted/30"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {posts.map((post) => {
                          const PlatIcon = platformIcon[post.platform] ?? CalendarDays;
                          return (
                            <div
                              key={post.title}
                              className="flex items-center gap-1 rounded px-1 py-0.5 bg-primary/10"
                            >
                              <PlatIcon
                                className={`h-2.5 w-2.5 shrink-0 ${platformColor[post.platform] ?? "text-primary"}`}
                              />
                              <span className="text-[10px] text-foreground truncate leading-tight">
                                {post.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de próximos posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPosts.map((post) => {
              const PlatIcon = platformIcon[post.platform] ?? CalendarDays;
              return (
                <div
                  key={post.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border"
                >
                  <PlatIcon
                    className={`h-4 w-4 mt-0.5 shrink-0 ${platformColor[post.platform] ?? "text-primary"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.date} · {post.time}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {post.platform}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
