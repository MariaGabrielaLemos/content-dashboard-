import {
  Trophy,
  Heart,
  MessageCircle,
  Image,
  Film,
  LayoutGrid,
  Clock,
  TrendingUp,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  });
}

function mediaLabel(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return "Vídeo";
  if (type === "CAROUSEL_ALBUM") return "Carrossel";
  return "Imagem";
}

function mediaIcon(type: IGMedia["media_type"]) {
  if (type === "VIDEO") return <Film className="h-4 w-4 text-muted-foreground" />;
  if (type === "CAROUSEL_ALBUM") return <LayoutGrid className="h-4 w-4 text-muted-foreground" />;
  return <Image className="h-4 w-4 text-muted-foreground" />;
}

const medalColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const medalBorders = ["border-yellow-400/30", "border-slate-400/30", "border-amber-600/30"];

function analyzePost(
  post: IGMedia,
  avgLikes: number,
  avgComments: number,
  followers: number
): string {
  const parts: string[] = [];

  const date = new Date(post.timestamp);
  const hour = date.getHours();
  const dayIndex = date.getDay();
  const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const dayName = dayNames[dayIndex];

  // Desempenho de curtidas vs média
  const likeRatio = avgLikes > 0 ? post.like_count / avgLikes : 1;
  if (likeRatio >= 2) {
    parts.push(`As curtidas foram ${likeRatio.toFixed(1)}x acima da média do período (${formatCount(Math.round(avgLikes))}), indicando forte apelo visual ou tema muito relevante para o público.`);
  } else if (likeRatio >= 1.3) {
    parts.push(`As curtidas ficaram ${Math.round((likeRatio - 1) * 100)}% acima da média do período (${formatCount(Math.round(avgLikes))}), sinal de bom desempenho orgânico.`);
  } else {
    parts.push(`As curtidas ficaram próximas à média do período (${formatCount(Math.round(avgLikes))}), mas o engajamento geral se destacou.`);
  }

  // Comentários e qualidade de engajamento
  const commentRatio = post.like_count > 0 ? post.comments_count / post.like_count : 0;
  if (commentRatio >= 0.15) {
    parts.push(`A taxa de comentários por curtida foi de ${(commentRatio * 100).toFixed(1)}%, bem acima do típico (5–10%), o que sugere que o conteúdo gerou discussão e conexão com a audiência.`);
  } else if (commentRatio >= 0.07) {
    parts.push(`A proporção de comentários foi de ${(commentRatio * 100).toFixed(1)}% em relação às curtidas, indicando boa interação além do simples "curtir".`);
  } else if (post.comments_count > avgComments) {
    parts.push(`Os comentários ficaram acima da média (${formatCount(Math.round(avgComments))}), mesmo com proporção moderada em relação às curtidas.`);
  }

  // Tipo de mídia
  if (post.media_type === "CAROUSEL_ALBUM") {
    parts.push(`O formato carrossel tende a aumentar o tempo de visualização e o número de interações, pois incentiva o usuário a deslizar — fator que o algoritmo do Instagram valoriza.`);
  } else if (post.media_type === "VIDEO") {
    parts.push(`Vídeos costumam receber maior distribuição orgânica pelo algoritmo, especialmente quando geram replays ou compartilhamentos.`);
  }

  // Horário de publicação
  if (hour >= 18 && hour <= 22) {
    parts.push(`A publicação às ${hour}h em uma ${dayName} coincide com o pico noturno de uso do Instagram, favorecendo o alcance inicial.`);
  } else if (hour >= 12 && hour <= 14) {
    parts.push(`Publicado ao meio-dia em uma ${dayName}, horário de alto tráfego que impulsiona o alcance logo nas primeiras horas.`);
  } else if (hour >= 7 && hour <= 9) {
    parts.push(`Publicado de manhã (${hour}h), quando boa parte dos usuários verifica o feed antes do trabalho.`);
  } else {
    parts.push(`Publicado às ${hour}h em uma ${dayName}.`);
  }

  // Hashtags
  if (post.caption) {
    const hashtagCount = (post.caption.match(/#\w+/g) ?? []).length;
    if (hashtagCount >= 10) {
      parts.push(`O uso de ${hashtagCount} hashtags amplia a descoberta do post por novas audiências fora dos seguidores.`);
    } else if (hashtagCount >= 3) {
      parts.push(`As ${hashtagCount} hashtags utilizadas ajudam na descoberta do post sem prejudicar a leitura da legenda.`);
    } else if (hashtagCount === 0) {
      parts.push(`O post não utilizou hashtags; o bom desempenho foi impulsionado pelo engajamento orgânico da audiência já existente.`);
    }
  }

  // Taxa de engajamento total
  if (followers > 0) {
    const engRate = ((post.like_count + post.comments_count) / followers) * 100;
    if (engRate >= 5) {
      parts.push(`A taxa de engajamento de ${engRate.toFixed(2)}% é considerada excelente para contas com esse porte (referência: acima de 3% é alto no Instagram).`);
    } else if (engRate >= 2) {
      parts.push(`A taxa de engajamento de ${engRate.toFixed(2)}% está dentro de um intervalo saudável para contas do mesmo segmento.`);
    }
  }

  return parts.join(" ");
}

export default async function TopPostsPage() {
  const [profile, allMedia] = await Promise.all([
    getProfile(),
    getRecentMedia(100),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const topPosts = allMedia
    .filter((m) => new Date(m.timestamp) >= sixMonthsAgo)
    .sort((a, b) => b.like_count - a.like_count);

  const avgLikes =
    topPosts.length > 0
      ? topPosts.reduce((s, m) => s + m.like_count, 0) / topPosts.length
      : 0;

  const avgComments =
    topPosts.length > 0
      ? topPosts.reduce((s, m) => s + m.comments_count, 0) / topPosts.length
      : 0;

  const followers = profile?.followers_count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Melhores Posts</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Posts com melhor desempenho dos últimos 6 meses, ordenados por curtidas.
          {topPosts.length > 0 && (
            <span className="ml-2 text-xs">
              Média do período: {formatCount(Math.round(avgLikes))} curtidas · {formatCount(Math.round(avgComments))} comentários
            </span>
          )}
        </p>
      </div>

      {topPosts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Nenhum post encontrado nos últimos 6 meses.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {topPosts.map((post, index) => {
            const engRate =
              followers > 0
                ? (((post.like_count + post.comments_count) / followers) * 100).toFixed(2)
                : null;
            const commentRatio =
              post.like_count > 0
                ? ((post.comments_count / post.like_count) * 100).toFixed(1)
                : "0";
            const analysis = analyzePost(post, avgLikes, avgComments, followers);
            const isMedal = index < 3;

            return (
              <Card
                key={post.id}
                className={isMedal ? medalBorders[index] : ""}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Cabeçalho do post */}
                  <div className="flex items-start gap-4">
                    {/* Posição */}
                    <div className="w-8 shrink-0 flex flex-col items-center gap-1 pt-1">
                      {isMedal ? (
                        <Trophy className={`h-5 w-5 ${medalColors[index]}`} />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Miniatura */}
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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

                    {/* Info principal */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={isMedal ? "success" : "secondary"}>
                          {index === 0 ? "1º lugar" : index === 1 ? "2º lugar" : index === 2 ? "3º lugar" : `#${index + 1}`}
                        </Badge>
                        <Badge variant="outline">{mediaLabel(post.media_type)}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.timestamp)}
                        </span>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver no Instagram
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.caption ?? "(sem legenda)"}
                      </p>
                    </div>
                  </div>

                  {/* Métricas individuais */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Curtidas
                      </p>
                      <p className="text-xl font-bold">{formatCount(post.like_count)}</p>
                      {post.like_count > avgLikes && (
                        <p className="text-xs text-emerald-400">
                          +{Math.round(((post.like_count - avgLikes) / avgLikes) * 100)}% vs média
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Comentários
                      </p>
                      <p className="text-xl font-bold">{formatCount(post.comments_count)}</p>
                      {post.comments_count > avgComments && (
                        <p className="text-xs text-emerald-400">
                          +{Math.round(((post.comments_count - avgComments) / avgComments) * 100)}% vs média
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Engajamento
                      </p>
                      <p className="text-xl font-bold">
                        {engRate ? `${engRate}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCount(post.like_count + post.comments_count)} interações
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Coment. / Curtida
                      </p>
                      <p className="text-xl font-bold">{commentRatio}%</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(commentRatio) >= 10 ? "Alta conversação" : "Engajamento passivo"}
                      </p>
                    </div>
                  </div>

                  {/* Análise */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Análise de desempenho
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
