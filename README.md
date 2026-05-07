# WBR Dashboard — Fernando Moulin

Painel executivo de **Weekly Business Review** que substitui a leitura manual no MLABS para o Fernando. Construído sobre o repo da Maria com motor MetaAPI já validado.

## Por que existe

Requisito direto do Fernando (WBR 2026-05-01):

> "Quando tu fizer 90 dias rolling, deixa fixo Q1, Q2, Q3, Q4 (...). Cada semana que passa ele anda uma semana pra frente. E é importante a gente ter o período de planejamento do ano fechado também. Estáticas e dinâmicas, sacou?"

E do plano original em `wiki/clientes/fernando-moulin/deep.md`:

> Substitui MLABS para WBRs. Comparativos rolling (7/30/90 dias) + estáticos trimestrais (Q1/Q2/Q3/Q4) + gráfico projetado vs realizado + botão de feedback do Fernando diretamente na dashboard.

## O que tem agora

### Visão executiva

- **Painel** (`/dashboard`) — KPIs principais (Seguidores, Alcance 7d, Engajamento 7d, Taxa Eng) com delta vs período anterior. Evolução 30d em area chart. Acesso rápido pras 5 seções mais usadas. Últimos feedbacks do Fernando.
- **WBR · Comparativos** (`/dashboard/wbr`) — **CORE.** Toggle Rolling/Trimestre. Em rolling, mostra colunas 7d/30d/90d lado a lado, cada uma comparada com a janela anterior. Em trimestre, mostra Q1/Q2/Q3/Q4 fixos comparados ao trimestre anterior. Tabela de 10 métricas (seguidores, alcance, impressões, engajamento, taxa, curtidas, comentários, salvamentos, compartilhamentos, posts). Resumo "melhoraram / pioraram" no topo.
- **Projetado vs Realizado** (`/dashboard/projection`) — Define metas (seguidores, alcance, engajamento) com baseline + prazo. Plota linha projetada (linear baseline → meta) + linha realizada da Meta API. Status "no ritmo / abaixo do ritmo".
- **Feedback do Fernando** (`/dashboard/feedback`) — Log persistido de aprovações, ajustes e sugestões registrados em qualquer seção via botão "Feedback do Fernando". Substitui o WhatsApp como base de aprendizado.

### Operacional (já existia, mantido)

- **Melhores posts (6 meses)** — ranking por curtidas com análise individual.
- **Calendário do mês** — grade visual + lista de posts.
- **Gerenciador Instagram** — feed bruto recente.
- **Analytics** — KPIs e top conteúdo.

## Stack

| Camada | Tech |
|---|---|
| Framework | Next.js 16 (Turbopack, App Router) |
| TypeScript | 5 (strict) |
| Estilo | Tailwind 3 + paleta Polaris (dark) |
| Charts | Recharts |
| Dates | date-fns + locale pt-BR |
| Componentes | shadcn/ui |
| API | Meta Graph API v21 (`/me`, `/{ig-id}/media`, `/{media}/insights`, `/{ig-id}/insights`) |
| Persistência (V1) | JSON local em `data/` (feedback + goals) — migrar pra DB no deploy |

## Brand

Paleta **Polaris** dark (do branding book oficial):

- `#101518` Cosmo (bg)
- `#192433` Polar (cards)
- `#EFEFEF` Off-White (texto)
- `#F6551A` Elétrico (primary)
- `#C73E0B` Brasa (secondary/hover)
- `#A23B16` Terra

## Setup

```bash
npm install
cp .env.example .env.local
# preencher INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID
npm run dev
# http://localhost:3000
```

Quando a Meta API não responder (token expirado ou ausente), as páginas mostram **empty states honestos** em vez de quebrar.

## Deploy

Antes do deploy real:

1. Trocar storage de `feedback` e `goals` (hoje em `data/*.json`) por DB persistente (recomendado: Supabase).
2. Adicionar autenticação (Fernando + equipe Drop). Hoje não há login.
3. Plugar histórico de seguidores via job diário (snapshot em DB).

## Pendente (não bloqueia apresentação)

- `/dashboard/analytics` usar audiência real via `/insights/audience_gender_age` (helper já existe em `lib/instagram.ts:getAudience`).
- `/dashboard/competitors` e `/dashboard/news` — placeholders, fora do escopo WBR.
- Aprovação de criativos *dentro* da dashboard (precisa upload + integração com pipeline de criação).
