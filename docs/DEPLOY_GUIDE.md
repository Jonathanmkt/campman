# Guia de Deploy - Campanha Thiago Moura no Portainer via Docker Swarm

Este guia detalha como configurar e publicar o projeto **Campanha Thiago Moura** (Next.js + Supabase) no Portainer usando Docker Swarm.

## 📋 Visão Geral

O projeto será containerizado e publicado automaticamente via GitHub Actions no GitHub Container Registry (GHCR), depois deployado no Portainer com Traefik para roteamento HTTPS.

**Domínio de produção:** `app.thiagomoura.com.br`

## 🏗️ Arquivos de Configuração

### 1. Dockerfile (já existente)

O Dockerfile utiliza multi-stage build otimizado para Next.js:

```dockerfile
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

# Variáveis de ambiente para build
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
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
```

### 2. GitHub Actions Workflow

Arquivo `.github/workflows/build-and-push.yml`:

```yaml
name: Docker Build and Publish

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: jonathanmkt/campanha-thiago-moura

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      actions: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,format=long
            type=raw,value=latest

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_SITE_URL=${{ secrets.NEXT_PUBLIC_SITE_URL }}
            NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Logout from Container registry
        if: always()
        run: docker logout ${{ env.REGISTRY }}
```

### 3. Docker Compose para Portainer

Arquivo `docker-compose.yml`:

```yaml
version: '3'
services:
  campanha-thiago-moura:
    image: ghcr.io/jonathanmkt/campanha-thiago-moura:latest
    networks:
      - Singanet
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      labels:
        - traefik.enable=1
        - traefik.http.routers.campanha-thiago-moura.rule=Host(`app.thiagomoura.com.br`)
        - traefik.http.routers.campanha-thiago-moura.entrypoints=websecure
        - traefik.http.routers.campanha-thiago-moura.priority=1
        - traefik.http.routers.campanha-thiago-moura.tls.certresolver=letsencryptresolver
        - traefik.http.routers.campanha-thiago-moura.service=campanha-thiago-moura
        - traefik.http.services.campanha-thiago-moura.loadbalancer.server.port=3000
        - traefik.http.services.campanha-thiago-moura.loadbalancer.passHostHeader=true
      placement:
        constraints:
          - node.role == manager

networks:
  Singanet:
    external: true
```

### 4. .dockerignore

Arquivo `.dockerignore` na raiz:

```
node_modules
.git
.gitignore
README.md
Dockerfile
.dockerignore
npm-debug.log
.nyc_output
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.next
.vscode
.idea
docs
*.md
*.json.bak
*.html
*.py
*.ps1
scripts
```

## 🔧 Configuração no GitHub

### 1. Secrets do Repositório

No GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

| Secret | Descrição |
|--------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `https://app.thiagomoura.com.br` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

### 2. Permissões do GITHUB_TOKEN

O `GITHUB_TOKEN` já tem permissões para escrever no GHCR. Certifique-se de que:
- O repositório permite Actions
- Packages estão habilitados nas configurações do repositório

## 🚀 Configuração no Portainer

### 1. Pré-requisitos

- Rede `Singanet` existente no Docker Swarm
- Traefik configurado com Let's Encrypt
- DNS do domínio `app.thiagomoura.com.br` apontando para o servidor

### 2. Deploy via Stack

1. Acesse **Stacks** no Portainer
2. Clique em **Add stack**
3. Nome: `campanha-thiago-moura`
4. Cole o conteúdo do `docker-compose.yml`
5. Deploy

### 3. Configuração do Traefik

Certifique-se de que:
- O domínio `app.thiagomoura.com.br` aponta para seu servidor (registro A no DNS)
- O Traefik está configurado com Let's Encrypt (`letsencryptresolver`)
- A rede `Singanet` existe e está configurada como overlay

## 📊 Recursos Configurados

| Recurso | Limite | Reserva |
|---------|--------|---------|
| CPU | 0.5 cores | 0.25 cores |
| RAM | 512MB | 256MB |
| Porta | 3000 (interna) | - |

## 🔄 Fluxo de Deploy

```
1. Push para main → Trigger do GitHub Actions
2. GitHub Actions → Build da imagem Docker + Push para GHCR
3. Portainer → Pull da nova imagem (manual ou webhook)
4. Traefik → Roteamento do tráfego HTTPS automático
```

## 🛠️ Comandos Úteis

### Testar localmente com Docker

```bash
# Build da imagem
docker build -t campanha-thiago-moura .

# Executar localmente
docker run -p 3000:3000 campanha-thiago-moura
```

### Verificar logs no Portainer

1. Acesse **Services** ou **Containers**
2. Clique no serviço `campanha-thiago-moura`
3. Aba **Logs**

## 🔍 Troubleshooting

### Problemas comuns:

1. **Build falha**: Verifique se os Secrets estão configurados no GitHub
2. **Container não inicia**: Verifique os logs no Portainer
3. **Domínio não resolve**: Verifique configuração DNS (registro A)
4. **Erro 502**: Verifique se a porta 3000 está correta no docker-compose
5. **Certificado SSL inválido**: Aguarde propagação do Let's Encrypt (pode levar alguns minutos)

### Checklist de Verificação:

- [ ] Secrets configurados no GitHub (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Dockerfile na raiz do projeto
- [ ] .dockerignore na raiz do projeto
- [ ] GitHub Actions workflow configurado
- [ ] Docker-compose.yml com domínio correto (`app.thiagomoura.com.br`)
- [ ] DNS apontando para o servidor
- [ ] Rede `Singanet` existe no Docker Swarm
- [ ] Traefik configurado com Let's Encrypt

## 📝 Notas Importantes

1. **HTTPS automático**: Via Traefik + Let's Encrypt
2. **Deploy automático**: A cada push na branch `main`
3. **Custo zero**: GitHub Container Registry gratuito para repositórios públicos
4. **Segurança**: Container roda com usuário não-root

## 🎯 Ordem de Implementação

1. Criar/atualizar `.dockerignore`
2. Atualizar `Dockerfile` com variáveis de ambiente do Supabase
3. Atualizar `docker-compose.yml` com configurações Traefik
4. Atualizar workflow GitHub Actions com secrets
5. Configurar Secrets no GitHub
6. Configurar DNS do domínio
7. Fazer push para trigger do primeiro build
8. Configurar Stack no Portainer
9. Testar acesso via domínio

---

**Projeto**: Campanha Thiago Moura  
**Domínio**: app.thiagomoura.com.br  
**Repositório**: jonathanmkt/campanha-thiago-moura  
**Data**: Dezembro 2024
