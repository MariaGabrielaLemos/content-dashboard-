# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Fuso de Brasília no runtime. Sem isso o container roda em UTC e o agrupamento
# de posts por dia (isSameDay/getDate/eachDayOfInterval) joga posts publicados à
# noite (21h-23h BRT) para o dia seguinte em UTC — criando "dias sem post"
# falsos no gráfico e no calendário. Alpine/musl exige tzdata pro TZ valer no Date.
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/_cache && chown nextjs:nodejs /app/_cache

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
