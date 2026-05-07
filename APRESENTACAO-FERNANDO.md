# Apresentação Fernando — WBR Dashboard

> Nota deixada pra Gabriel acordar e revisar antes da call. Preparada por Claude na madrugada de 07/05/2026.

## TL;DR — 30 segundos

A dashboard da Maria virou **WBR-first** (Weekly Business Review). Substituí o que tinha de placeholder por estrutura que cumpre o que o Fernando pediu na WBR de 01/05:

- Comparativos rolling **7/30/90 dias** (cada coluna com delta vs janela anterior)
- Trimestres **fixos Q1/Q2/Q3/Q4** (chips clicáveis, comparados ao trimestre anterior)
- Gráfico **Projetado vs Realizado** (linha tracejada vs área cheia)
- **Feedback dentro da dashboard** (Aprovado / Ajuste / Sugestão), persistido como base de aprendizado — substitui o WhatsApp
- Brand **Polaris oficial** (Cosmo + Elétrico) substitui o roxo neon genérico

PR aberto pra Maria revisar: https://github.com/MariaGabrielaLemos/content-dashboard-/pull/1
Branch local funcional: `clientes/fernando-moulin/projetos/wbr-dashboard` na branch `feat/wbr-overhaul-claude`.

## Antes da call — checklist 5 min

```bash
cd clientes/fernando-moulin/projetos/wbr-dashboard
npm install   # dependências já estão no package.json (recharts + date-fns adicionados)
npm run dev   # http://localhost:3000
```

**Token Meta API:** o token herdado de `_infra/instagram-dashboard/.env.local` está em `.env.local` aqui também, mas validei que ele retorna `OAuthException: Cannot parse access token` — provavelmente expirou. Pra demo com dados reais, gera um novo no [Graph API Explorer](https://developers.facebook.com/tools/explorer/) e cola em `.env.local`. Sem token, todas as páginas mostram empty state honesto ("Sem dados da Meta API · configure as credenciais") em vez de quebrar.

## Roteiro pra apresentar (10–12 min)

### 1. Painel (`/dashboard`) — abrir aqui
- 4 KPIs no topo: Seguidores, Alcance 7d, Engajamento 7d, Taxa Eng. Cada um com delta colorido vs período anterior.
- Evolução 30d (area chart com Alcance + Engajamento sobrepostos)
- Acessos rápidos pras 5 seções mais usadas
- Card "Substitui o MLABS" no rodapé do sidebar — ancora o pitch

**Ponto Fernando:** "Aqui é o resumo executivo. Você abre, em 5 segundos vê se a semana foi boa ou não."

### 2. WBR · Comparativos (`/dashboard/wbr`) — **CORE**
Toggle visível no topo: **Rolling (dinâmico) | Trimestre (estático)**.

#### Modo Rolling (default)
- 3 colunas lado a lado: 7d / 30d / 90d
- Tabela de 10 métricas (seguidores, alcance, impressões, engajamento, taxa eng, curtidas, comentários, salvamentos, compartilhamentos, posts)
- Cada célula: número + delta% colorido vs janela anterior
- Acima da tabela: **Resumo da última semana** com cards verde (melhoraram) / vermelho (pioraram) — direto inspirado no Drop Tracker do Gustavo

#### Modo Trimestre
- Chips com Q1/Q2/Q3/Q4 (2025 + 2026, até o trimestre atual)
- Comparação fechada: trimestre selecionado vs trimestre anterior
- Útil pra "como fechou Q1 vs Q4 do ano passado"

**Ponto Fernando:** "Você falou exatamente isso na nossa última WBR — rolling pra ver o movimento e trimestre fixo pra fechar planejamento de ano. Está aqui."

### 3. Projetado vs Realizado (`/dashboard/projection`)
- Cria meta com baseline + prazo + valor alvo
- Linha tracejada (azul claro) é o projetado linear baseline → meta
- Área cheia laranja é o realizado puxado da Meta API
- Status "No ritmo / Abaixo do ritmo" badge no card
- 3 stats: Realizado · Projetado pra hoje · Diferença vs ritmo

**Ponto Fernando:** "Vou poder olhar e saber se a meta de Q2 vai ser batida ou não."

### 4. Feedback (`/dashboard/feedback`)
- 3 cards no topo: Aprovado (verde) / Ajuste (vermelho) / Sugestão (amarelo) com contagem
- Lista cronológica de todos os feedbacks já registrados em qualquer seção
- Cada card mostra contexto (qual seção da dashboard recebeu o feedback) + timestamp
- Botão "Feedback do Fernando" disponível em todas as páginas principais

**Ponto Fernando:** "A revisão que você faz aqui vira insumo de aprendizado pra Drop. Cada 'esse aqui voou' ou 'esse não é nossa linha editorial' fica salvo, gera padrão. Substitui o Zap como base de conhecimento."

### 5. Operacional (sidebar de baixo) — show & tell rápido
- Melhores posts (6m): ranking com análise individual por post
- Calendário do mês: grade visual + lista de posts publicados
- Gerenciador IG: feed bruto recente
- Analytics: KPIs e top conteúdo

## Talking points específicos pro Fernando

1. **"Substitui o MLABS"** — repetir 3x. É o que ele quer ouvir.
2. **"Estáticas e dinâmicas"** — palavra exata dele na WBR, agora literal na UI.
3. **"Sai do WhatsApp"** — feedback dentro da dashboard era preocupação dele ("o Zap eu olho o dia inteiro, mas plataforma eu tenho que abrir"). Mostrar que tem só onde precisa: o ping continua no WhatsApp, mas o conteúdo + log moram aqui.
4. **"Dois nortes editoriais"** — alcance vs engajamento aparece separado nas KPIs (não soma cru). Casa com o que a Maria falou na WBR sobre "o que viraliza não é o que engaja".
5. **Brand Polaris** — não vender como detalhe técnico. Só dizer "está com a sua identidade visual" se ele perguntar do roxo de antes.

## O que NÃO está pronto (responder se perguntarem)

- **Aprovação de criativo dentro da dashboard** (você revisar peça antes da Maria publicar): escopo separado, requer pipeline de upload + thumbnail + integração com a criação. Plano: próxima sprint.
- **Audiência demográfica real** (faixa etária, gênero, cidades top): helper já existe em `lib/instagram.ts:getAudience`, falta plugar no JSX da página Analytics. Resolve em ~1h.
- **Histórico de seguidores diário real**: hoje a curva "realizada" é interpolada linear. Pra ter pontos reais, precisa job que faz snapshot diário em DB (Supabase). 1–2 dias de trabalho.
- **Login**: a dashboard não tem auth. Quem tem o link, entra. Pré-deploy resolve.

## Fallbacks se algo quebrar ao vivo

| Problema | O que falar |
|---|---|
| Meta API não retorna nada | "O token expirou — vou regenerar depois. A estrutura tá toda funcional" → mostrar empty states (que são intencionais e bonitos) |
| Página não carrega | Abre `/dashboard/feedback` que não depende de API e tem dados de exemplo |
| Pergunta sobre Mídia paga (CPA, orçamento) | "O Drop Tracker do Gustavo tinha esses campos via planilha porque vocês não rodavam mídia paga ali. Como sua estratégia é orgânica (esse é o ponto), as métricas aqui são de Insights orgânico — alcance, engajamento, taxa. Quando rodarmos paid no futuro, plugamos Marketing API por cima" |

## Capturas (já salvas em `docs/`)

- `screenshot-overview.png` — painel
- `screenshot-wbr-rolling.png` — WBR modo rolling
- `screenshot-wbr-quarter.png` — WBR modo trimestre
- `screenshot-projection.png` — projetado vs realizado
- `screenshot-feedback.png` — log de feedback (com 3 entries de exemplo derivadas literalmente da WBR de 01/05)

## Status do PR

- Branch: `feat/wbr-overhaul-claude`
- PR: https://github.com/MariaGabrielaLemos/content-dashboard-/pull/1
- Base: `master`
- 32 arquivos · +3068 / -404 linhas
- TypeScript: ✅ passa em strict mode
- Build Next.js 16: ✅ todas as 16 rotas compilam (15 estáticas + 1 dinâmica)

## Próxima sprint sugerida

1. Plugar Supabase pra `feedback` + `goals` (hoje em JSON local — não escala em Vercel multi-instância).
2. Auth simples (Fernando + equipe Drop).
3. Job diário de snapshot de seguidores → curva real em Projection.
4. Plugar audiência real em `/dashboard/analytics`.
5. Começar discussão de aprovação de criativos (escopo: upload + lista de aprovação + ping WhatsApp).
