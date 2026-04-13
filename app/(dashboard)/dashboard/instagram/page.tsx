import {
  Instagram,
  Image,
  MessageCircle,
  Heart,
  TrendingUp,
  Plus,
  Clock,
  Users,
  Film,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile, getRecentMedia, IGMedia } from "@/lib/instagram";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mediaIcon(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return <Film className="h-5 w-5 text-muted-foreground" />;
  if (type === "CAROUSEL_ALBUM") return <LayoutGrid className="h-5 w-5 text-muted-foreground" />;
  return <Image className="h-5 w-5 text-muted-foreground" />;
}

export default async function InstagramPage() {
  const [profile, media] = await Promise.all([getProfile(), getRecentMedia(10)]);

  const avgLikes =
    media.length > 0
      ? Math.round(media.reduce((s, m) => s + m.like_count, 0) / media.length)
      : 0;

  const avgComments =
    media.length > 0
      ? Math.round(media.reduce((s, m) => s + m.comments_count, 0) / media.length)
      : 0;

  const stats = [
    {
      label: "Seguidores",
      value: profile ? formatCount(profile.followers_count) : "—",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Posts",
      value: profile ? formatCount(profile.media_count) : "—",
      icon: <Image className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Média de Curtidas",
      value: media.length > 0 ? formatCount(avgLikes) : "—",
      icon: <Heart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Média de Comentários",
      value: media.length > 0 ? formatCount(avgComments) : "—",
      icon: <MessageCircle className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Gerenciador Instagram</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {profile
              ? `@${profile.username} — dados atualizados agora`
              : "Agende posts, gerencie seu feed e acompanhe o desempenho."}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Posts Recentes</h2>

        {media.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              Nenhum post encontrado. Verifique o token de acesso.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {media.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Miniatura */}
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {post.media_url || post.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.thumbnail_url ?? post.media_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      mediaIcon(post.media_type)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {post.caption ?? "(sem legenda)"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.timestamp)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        {formatCount(post.like_count)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        {formatCount(post.comments_count)}
                      </span>
                    </div>
                  </div>

                  <Badge variant="success">publicado</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
