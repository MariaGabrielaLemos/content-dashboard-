# Feedback Fernando — 2026-05-25

Feedback recebido via WhatsApp (deveria ter ido pela dashboard, mas a feedback queue quebrou — ver Bug #4 abaixo).

## Feedback verbatim

> **[Seção Painel]**
> 1. Painel de atualização está com hora errada (escrevo feedback às 15:37 e ele está marcando 25/05 às 17:26). Quando fui ao WBR Comparativos, está atualizado como se fosse 3 hs à frente;
> 2. Os números detalhados em cada caixinha do painel foram checados e verificados vs. MLabs / Instagram? Tudo me parecendo super baixo;
> 3. Não seria melhor criar um outro eixo do lado direito do gráfico de evolução, sendo a escala da esquerda referente a alcance e a da direita referente a engajamento?
>
> **[WBR Comparativos]**
> Não tive como analisar, pois os dados não estão atualizados. As views estão boas. Atenção com os comparativos, parecem estar comparando semana contra mês contra trimestre, e não as mesmas bases.
>
> **[Projetado vs. Realizado]** A ideia é ótima, não há como analisar ainda por falta de atualização.
>
> **[Melhores posts] [Reels]**
> Ficou sensacional a ideia! Senti falta de incluirmos também o número de visualizações + o número de setinhas. Onde estão os posts do tênis e do C. Ronaldo? Acho que eles não têm mais de 6 meses...
>
> **[Calendário do Mês]** ótimo!

---

## Aprendizados do dashboard Mission Control v2 (Gabriel Pedrozo) que se aplicam

Mission Control v2 é o dashboard de funil 3 camadas do GP (Metabase em `drop-nexus:8081`, Tailscale-only, postgres-backed).

| Padrão | Como se aplica aqui |
|---|---|
| **Persistência sempre em postgres**, nunca filesystem | Bug #4 (feedback queue) é EXATAMENTE o anti-pattern que Mission Control evita. Migrar `feedback-store.ts` pra postgres VPS Drop (`dropstudios_meta`) no PR #4 — alinhado com stack Drop (postgres self-hosted Coolify, NÃO Supabase). |
| **Server emite UTC, render formata pra BRT explícito** | Bug #1 — Metabase faz isso via TZ config. Aqui usar `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })` ou `date-fns-tz formatInTimeZone`. |
| **Real-time via webhook quando provider oferece** | Não aplicável: Meta Graph API não tem webhook pra insights. Mantém revalidate ISR + Refresh manual. |
| **Cache disk é cilada em Vercel stateless** | Já documentado em `lib/instagram.ts`. PR #4 migra dashboard pra Coolify VPS, onde filesystem persiste — cache de insights passa a funcionar (ou migra pra tabela postgres em `dropstudios_meta` se valer a pena). |

---

## Plano de execução

Branch: `fix/fernando-feedback-2026-05-25` (base: `master`)
PR alvo: #3 (draft) em `MariaGabrielaLemos/content-dashboard-`

### Bug #1 — Timestamp 3h à frente (TZ)

**Root cause:** Vercel server roda em UTC. `format(parseISO(fetchedAt), "dd/MM 'às' HH:mm", { locale: ptBR })` formata na TZ local do server (UTC), não na TZ do leitor (BRT, UTC-3).

**Fix:**
1. Instalar `date-fns-tz` (~5KB)
2. Criar helper `lib/datetime.ts`:
   ```ts
   import { formatInTimeZone } from 'date-fns-tz';
   import { ptBR } from 'date-fns/locale';
   export const TZ_BR = 'America/Sao_Paulo';
   export function fmtBR(iso: string | Date, pattern = "dd/MM 'às' HH:mm") {
     return formatInTimeZone(iso, TZ_BR, pattern, { locale: ptBR });
   }
   ```
3. Substituir todos os `format(parseISO(fetchedAt), ...)` por `fmtBR(fetchedAt, ...)` nas páginas: `dashboard/page.tsx`, `dashboard/reels/page.tsx`, `dashboard/wbr/page.tsx`, `dashboard/top-posts/page.tsx`, `dashboard/projection/page.tsx`, etc.
4. Mesmo helper aplicado em qualquer `format(day, ...)` que represente data de publicação (consistência).

**Aceitação:** Página recarregada às 15:37 BRT mostra "Atualizado 25/05 às 15:37" (não 18:37).

---

### Bug #2 — Números baixos / posts faltando (paginação Meta API)

**Root cause:** `getMediaWithInsights(60)` busca os ÚLTIMOS 60 itens. Pra:
- WBR Comparativos 90d rolling → pode truncar (Fernando posta diário em algumas semanas)
- WBR Q1/Q2 trimestral → 3 meses certamente estoura 60
- "Melhores posts (6 meses)" → 6 meses estoura 60 garantido. Por isso Ronaldo e tênis sumiram.
- Painel 7d → ok com 60
- Reels page já usa 120 (melhor)

**Fix:**
1. Implementar paginação em `getRecentMedia` usando cursor `next` do Meta Graph (`paging.next`):
   ```ts
   export async function getAllRecentMedia(opts: { sinceDate?: Date; maxItems?: number } = {}): Promise<IGMedia[]>
   ```
2. Adicionar parâmetro `since` (data) e `maxItems` (hard limit, ex: 500)
3. `getMediaWithInsights` aceita `{ sinceDate?: Date }`:
   - Dashboard 7d → `since = 14 days ago` (margem 2x pra delta)
   - WBR Q1/Q2 → `since = startOfQuarter` da seleção
   - Top-posts 6 meses → `since = 6 months ago`
4. Cache key inclui `since` pra não invalidar entre páginas.
5. Cache TTL desce pra 30min (insights mudam pouco mas Fernando pediu refresh, dá uma margem).

**Aceitação:**
- Painel + Comparativos com números batendo (Maria/Fernando spot-check via MLabs em pelo menos 2 KPIs)
- Posts do C. Ronaldo e tênis aparecem em `/dashboard/top-posts` (se forem dos últimos 6 meses)
- Página `/dashboard/debug` (nova, ver Bug #2.5) lista total de posts retornados por janela

---

### Bug #2.5 — Página de debug pra verificação Maria/Fernando

**Nova:** Não dá pra agente auto-verificar contra MLabs. Solução: expor a fonte da verdade.

**Implementar:** `/dashboard/debug` (server-only, sem link no sidebar — acesso via URL direta)
- Total de posts retornados nos últimos 7/30/90/180 dias
- Por janela: soma de reach, views, likes, comments, shares, saves (raw, sem formato compact)
- Link permalink dos top 5 por views em cada janela
- Timestamp do cache (com TZ correto)
- Erros recentes da Meta API (já existe `getRecentErrors()`)

**Aceitação:** Maria abre `/dashboard/debug`, compara 3 números com MLabs, encontra diff → reporta na feedback queue (que vai estar funcionando após Bug #4).

---

### Bug #3 — Dual axis no Evolution Chart

**Root cause:** `components/evolution-chart.tsx` linha 118 — `<YAxis />` único, escala dominada por reach (sempre 10-100× engagement).

**Fix:** Trocar pra dois YAxis com `yAxisId`:
```tsx
<YAxis yAxisId="left" orientation="left" tick={...} stroke="hsl(var(--chart-1))" />
<YAxis yAxisId="right" orientation="right" tick={...} stroke="hsl(var(--chart-4))" />
<Area yAxisId="left" dataKey="reach" ... />
<Area yAxisId="right" dataKey="engagement" ... />
```

**Detalhe:** Cor do tick de cada eixo combina com cor da série (visual cue). Mantém Tooltip + toggle existentes.

**Aceitação:** Engagement (centenas) e Reach (dezenas de milhares) visíveis na mesma escala visual.

---

### Bug #4 — Feedback queue quebrou (filesystem em Vercel stateless) **[MOVED → PR #4]**

**Root cause:** `lib/feedback-store.ts` escreve em `data/feedback.json`. Vercel rodando em function-as-a-service nunca persiste filesystem entre invocações nem entre deploys. **Por isso o feedback do Fernando de 2026-05-25 não chegou.**

**Decisão estratégica (2026-05-25):** Em vez de fix isolado, **migrar a dashboard inteira do Vercel pra rodar na VPS Drop via Coolify**. Fernando é cliente Drop — dashboard ficar em casa fecha o loop: mesma rede Docker que `dropstudios_meta`, zero exposure, sem hacks de connection cross-cloud. Vercel foi escolha inicial só porque a Maria montou a base; agora que virou ferramenta operacional Drop, volta pra infra Drop.

**Escopo PR #4 (separado deste, vem depois do PR #3 mergeado):**

1. **Dockerfile** + (opcional) `docker-compose.yml` ou só Coolify-managed build
2. **Coolify app** apontando pro repo `MariaGabrielaLemos/content-dashboard-`
3. **Domínio** `fernando.dropstudios.com.br` — DNS A record pra VPS (195.200.6.190), Traefik route, Let's Encrypt cert auto
4. **Env vars Coolify** (não mais `.env.production` commitado) — Meta token, postgres URL interna
5. **Feedback queue postgres** — schema abaixo + rewrite `lib/feedback-store.ts` usando `pg` client
6. **Cache de insights** — agora funciona em disco real (não é mais stateless); revisar TTL e considerar mover pra tabela postgres também
7. **`.env.production` removido** do repo (vira gitignored)
8. **Documentação Maria** — workflow continua "push to master → auto-deploy", só muda destino (Coolify webhook ao invés de Vercel webhook)

**Schema postgres (vai em `dropstudios_meta`):**
```sql
create table wbr_feedback_fernando (
  id text primary key,
  context text not null,
  sentiment text check (sentiment in ('positive','negative','suggestion')) not null,
  message text not null,
  timestamp timestamptz default now() not null,
  status text check (status in ('open','queued','shipped','wontfix')) default 'open' not null
);
create index wbr_feedback_fernando_timestamp_idx on wbr_feedback_fernando (timestamp desc);
```

**Connection string interna Docker** (resolver nome do container na rede Coolify):
```
postgres://dropstudios:<password>@a4occgwokkok4ccgoow44w8o:5432/dropstudios_meta
```

**Escopo deste PR #3:** Bug #4 **fica como TODO** no `feedback-store.ts` (filesystem mantido como está, continua quebrado em prod até PR #4). Adicionar comment no topo do arquivo apontando pro spec + PR #4.

**Autorizações concedidas (PR #4 — execução com aviso passo-a-passo):**
- ✅ Criar app no Coolify
- ✅ Criar registro DNS A
- ✅ Criar tabela no postgres `dropstudios_meta`
- ⚠️ Avisar Gabriel antes de cada passo, nada autonomamente

**Aceitação (PR #4):** Submeter feedback via FAB persiste no postgres; reload de `/dashboard/feedback` mostra; survive deploy; dashboard live em `https://fernando.dropstudios.com.br`; Maria push to master → auto-deploy Coolify.

---

### Bug #5 — WBR Comparativos "misturando bases"

**Root cause:** Cálculo está CORRETO (cada coluna 7d/30d/90d vs sua própria janela anterior — ver `lib/wbr.ts` `rollingPeriod`). Mas UI é ambígua: 3 colunas lado a lado com label "vs anterior" leva o leitor a comparar entre colunas.

**Fix UI:**
1. Renomear header de cada coluna pra:
   - "**Últimos 7 dias** · vs 7 dias anteriores"
   - "**Últimos 30 dias** · vs 30 dias anteriores"
   - "**Últimos 90 dias** · vs 90 dias anteriores"
2. Adicionar disclaimer pequeno acima da tabela:
   > "Cada coluna é uma janela independente comparada à sua própria janela anterior. Os números entre colunas não são comparáveis (representam intervalos diferentes)."
3. Considerar separar em 3 cards (1 por janela) pra reforçar visualmente — **decisão UI**: deixar como está com label novo PRIMEIRO, ver se resolve. Se Fernando ainda confundir na próxima WBR, refatorar.

**Aceitação:** Header e disclaimer claros; Fernando não lê mais como cross-comparison.

---

### Bug #6 — Melhores posts: views + shares

**Root cause:** `app/(dashboard)/dashboard/top-posts/page.tsx` (não inspecionado em detalhe) provavelmente mostra likes/comments mas não views nem shares.

**Fix:** Adicionar 2 colunas (ou 2 stats nos cards) no top-posts: **Views** e **Shares** (setinhas). Layout análogo ao Reels page (linha 258-280 do reels page).

**Aceitação:** Top posts mostra Views + Shares ao lado de Likes/Comments.

---

### Bug #7 (implícito) — Projetado vs Realizado

Não tem bug próprio. Resolve sozinho quando Bug #1 (TZ) + Bug #2 (paginação) corrigirem.

---

## Pendências fora do escopo deste PR (flagged pra Gabriel decidir)

- **Stories Meta API** — pendência fase 2 documentada (precisa permissions diferentes no token)
- **Mixpost VPS Coolify** — pendência fase 2 (alternativa ao MLABS pra publicação)
- **Rotação periódica do token** — System User Token Meta tem TTL ~60d em alguns casos
- **CLAUDE.md está desatualizado** — descreve placeholder data, mas PR #1+#2 migrou pra Meta API real. Atualizar separadamente.

---

## Checklist PR #3 (este — fixes só)

- [x] Bug #1 (TZ) — `lib/datetime.ts` + replace `format(parseISO(...))` em todas as páginas
- [x] Bug #2 (paginação) — `getAllRecentMedia` + `since` em `getMediaWithInsights`
- [x] Bug #2.5 — `/dashboard/debug` page
- [x] Bug #3 (dual-axis) — `evolution-chart.tsx`
- [x] Bug #5 (WBR labels) — `wbr-comparison-table.tsx` headers + disclaimer
- [x] Bug #6 (top-posts views/shares) — `top-posts/page.tsx`
- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] PR draft aberto com link pra este doc na descrição
- [ ] Wiki Fernando atualizada com log de 2026-05-25

## Checklist PR #4 (separado — migração Vercel→VPS + Bug #4)

- [ ] `Bug #4` (feedback queue postgres) — `lib/feedback-store.ts` reescrito com `pg` client
- [ ] Migration SQL criada em `db/migrations/001_wbr_feedback_fernando.sql`
- [ ] Dockerfile do projeto
- [ ] Coolify app criada apontando pro repo (com aviso ao Gabriel)
- [ ] DNS A record `fernando.dropstudios.com.br` → 195.200.6.190 (com aviso ao Gabriel)
- [ ] Env vars migradas pra Coolify (Meta token + postgres URL interna)
- [ ] Tabela `wbr_feedback_fernando` criada em `dropstudios_meta` (com aviso ao Gabriel)
- [ ] `.env.production` removido do repo + adicionado ao `.gitignore`
- [ ] Cache de insights revisado (TTL + considerar mover pra postgres)
- [ ] Doc curta no `README.md` ou `CLAUDE.md` explicando o novo workflow de deploy pra Maria
- [ ] Vercel app antiga pausada/deletada após go-live na VPS
