# Stage 1: Dependências e base
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN apk add --no-cache libc6-compat

# Stage 2: Construção para produção
FROM base AS builder
WORKDIR /app
COPY . .

# Argumentos do build
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG GOOGLE_MAPS_SERVER_API_KEY

# Variáveis de ambiente para build
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV GOOGLE_MAPS_SERVER_API_KEY=$GOOGLE_MAPS_SERVER_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Ambiente de produção
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


# Copiar apenas arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
CMD ["npm", "run", "start"]
