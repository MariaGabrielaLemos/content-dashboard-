export const dynamic = "force-dynamic";

/**
 * /dashboard/debug — Spot-check Maria/Fernando vs MLabs / Instagram nativo.
 *
 * Por que existe: Fernando reportou (2026-05-25) que números "parecem super
 * baixos" em comparação com MLabs. Como o agente não tem acesso ao MLabs
 * pra cross-check, expomos a fonte da verdade: total de posts retornados
 * pela Meta API por janela + soma raw de cada métrica.
 *
 * Server component, sem link no sidebar (acesso só por URL direta).
 * Ver: docs/feedback-fernando-2026-05-25.md (Bug #2.5)
 */
import Link from "next/link";
import { Bug, ExternalLink } from "lucide-react";
import { subDays } from "date-fns";
import {
  getMediaWithInsights,
  getRecentErrors,
  getDiagnostics,
  getLastFetchedAt,
  type IGMedia,
} from "@/lib/instagram";
import { fmtBR } from "@/lib/datetime";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WindowStats {
  days: number;
  label: string;
  posts: IGMedia[];
  totals: {
    reach: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

function aggregateWindow(media: IGMedia[], days: number, ref: Date): WindowStats {
  const since = subDays(ref, days);
  const posts = media.filter((m) => new Date(m.timestamp) >= since);
  const totals = posts.reduce(
    (acc, p) => ({
      reach: acc.reach + (p.reach ?? 0),
      views: acc.views + (p.views ?? p.plays ?? 0),
      likes: acc.likes + p.like_count,
      comments: acc.comments + p.comments_count,
      shares: acc.shares + (p.shares ?? 0),
      saves: acc.saves + (p.saved ?? 0),
    }),
    { reach: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
  );
  return { days, label: `${days}d`, posts, totals };
}

function topByViews(posts: IGMedia[], n = 5): IGMedia[] {
  return [...posts]
    .sort((a, b) => (b.views ?? b.plays ?? 0) - (a.views ?? a.plays ?? 0))
    .slice(0, n);
}

export default async function DebugPage() {
  // 180d cobre todas as janelas (7/30/90/180).
  const now = new Date();
  const sinceDate = subDays(now, 180);
  const allMedia = await getMediaWithInsights({ sinceDate });

  const windows = [7, 30, 90, 180].map((d) => aggregateWindow(allMedia, d, now));
  const diagnostics = getDiagnostics();
  const errors = getRecentErrors();
  const fetchedAt = getLastFetchedAt();
  const fetchedLabel = fetchedAt ? fmtBR(fetchedAt) : "—";

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Bug}
        title="Debug · Spot-check vs MLabs"
        description="Página interna pra Maria/Fernando comparar contagens raw da Meta API com MLabs / Instagram nativo. Sem formatação compact, sem agregação WBR. Acesso só por URL direta."
        actions={
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            Coletado em {fetchedLabel}
          </Badge>
        }
      />

      {/* Status da conexão Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conexão Meta API</CardTitle>
          <CardDescription>
            Esquema detectado pelo prefixo do token + endpoint usado pelas queries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Configurado
              </dt>
              <dd className="font-medium">
                {diagnostics.configured ? "Sim" : "Não — falta env var"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Esquema
              </dt>
              <dd className="font-mono text-xs">{diagnostics.scheme}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Base URL
              </dt>
              <dd className="font-mono text-xs">{diagnostics.base}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Self path
              </dt>
              <dd className="font-mono text-xs">{diagnostics.selfPath}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Token prefix
              </dt>
              <dd className="font-mono text-xs">{diagnostics.tokenPrefix}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Janela coletada
              </dt>
              <dd className="text-xs">
                desde {fmtBR(sinceDate, "dd/MM/yyyy")} ({allMedia.length} posts)
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Por janela */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Totais raw por janela
        </h2>
        <Card>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/10 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 text-left">Janela</th>
                    <th className="px-4 py-2.5 text-right">Posts</th>
                    <th className="px-4 py-2.5 text-right">Reach</th>
                    <th className="px-4 py-2.5 text-right">Views</th>
                    <th className="px-4 py-2.5 text-right">Likes</th>
                    <th className="px-4 py-2.5 text-right">Comments</th>
                    <th className="px-4 py-2.5 text-right">Shares</th>
                    <th className="px-4 py-2.5 text-right">Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {windows.map((w) => (
                    <tr
                      key={w.days}
                      className="border-b border-border/30 last:border-0 tabular-nums"
                    >
                      <td className="px-4 py-2.5 font-medium">{w.label}</td>
                      <td className="px-4 py-2.5 text-right">
                        {w.posts.length.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.reach.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.views.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.likes.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.comments.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.shares.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {w.totals.saves.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top 5 por views em cada janela */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top 5 por views (por janela) — pra comparar com MLabs
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {windows.map((w) => {
            const top = topByViews(w.posts, 5);
            return (
              <Card key={w.days}>
                <CardHeader>
                  <CardTitle className="text-sm">{w.label}</CardTitle>
                  <CardDescription className="text-xs">
                    {w.posts.length} posts na janela
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {top.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhum post nesta janela.
                    </p>
                  ) : (
                    <ol className="space-y-2 text-xs">
                      {top.map((p, i) => (
                        <li
                          key={p.id}
                          className="flex items-center gap-2 border-b border-border/20 pb-2 last:border-0 last:pb-0"
                        >
                          <span className="w-4 text-right font-bold text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="font-mono tabular-nums">
                            {(p.views ?? p.plays ?? 0).toLocaleString("pt-BR")}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {fmtBR(p.timestamp, "dd/MM/yy")}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-[10px] uppercase text-muted-foreground/70">
                            {p.media_type}
                          </span>
                          <Link
                            href={p.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            ver
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Erros recentes da Meta API */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Erros recentes da Meta API ({errors.length})
        </h2>
        <Card>
          <CardContent className="p-4">
            {errors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum erro registrado nesta sessão de runtime.
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-mono">
                {errors.map((e, i) => (
                  <li
                    key={i}
                    className="border-b border-border/20 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-rose-400">[{e.status ?? "?"}]</span>{" "}
                    <span className="text-muted-foreground">{e.endpoint}</span>
                    {e.code != null && (
                      <span className="text-muted-foreground">
                        {" "}
                        · code={e.code}
                      </span>
                    )}
                    {e.message && (
                      <div className="mt-0.5 text-muted-foreground/80">
                        {e.message}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
