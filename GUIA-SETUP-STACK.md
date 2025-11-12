# 🚀 Guia Completo de Setup - Stack Next.js + React + TypeScript

> **Baseado no projeto app-singaerj** - Um guia detalhado para replicar a stack de sucesso em novos projetos

## 📋 Visão Geral da Stack

Esta stack foi testada e aprovada em produção, oferecendo:

- **Next.js 15.2.4** - Framework React com App Router
- **React 19.1.0** - Biblioteca de interface
- **TypeScript 5.8.2** - Tipagem estática
- **Tailwind CSS 3.4.1** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de UI modernos
- **Supabase** - Backend como serviço
- **Docker** - Containerização
- **GitHub Actions** - CI/CD automatizado

---

## 🛠️ Configuração Inicial do Projeto

### 1. Criação do Projeto Base

```bash
# Criar projeto Next.js com TypeScript
npx create-next-app@latest meu-projeto --typescript --tailwind --eslint --app --src-dir

# Navegar para o diretório
cd meu-projeto
```

### 2. Estrutura de Diretórios

Organize seu projeto seguindo esta estrutura:

```
meu-projeto/
├── .github/workflows/          # CI/CD
├── public/                     # Assets estáticos
├── src/
│   ├── app/                   # App Router (Next.js 13+)
│   ├── components/            # Componentes reutilizáveis
│   ├── contexts/              # Contextos React
│   ├── hooks/                 # Hooks customizados
│   ├── lib/                   # Utilitários e configurações
│   ├── types/                 # Definições TypeScript
│   └── middleware.ts          # Middleware Next.js
├── Dockerfile                 # Container Docker
├── docker-compose.yml         # Orquestração Docker
└── [arquivos de configuração]
```

---

## 📦 Dependências Essenciais

### 1. package.json Base

```json
{
  "name": "meu-projeto",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .js,.ts,.tsx"
  }
}
```

### 2. Dependências de Produção

```bash
# Framework e Core
npm install next@^15.2.4 react@^19.1.0 react-dom@^19.1.0

# TypeScript
npm install typescript@^5.8.2 @types/node@^20.17.30 @types/react@18.3.20 @types/react-dom@18.3.6

# Styling
npm install tailwindcss@^3.4.1 autoprefixer@^10.4.15 postcss@^8.4.35
npm install tailwindcss-animate@^1.0.7 tailwind-merge@^1.14.0 tailwind-scrollbar@^3.0.5

# UI Components (Shadcn/ui)
npm install @radix-ui/react-accordion@^1.2.0
npm install @radix-ui/react-alert-dialog@^1.0.4
npm install @radix-ui/react-avatar@^1.0.3
npm install @radix-ui/react-button@^1.0.3
npm install @radix-ui/react-dialog@^1.1.6
npm install @radix-ui/react-dropdown-menu@^2.1.6
npm install @radix-ui/react-label@^2.1.7
npm install @radix-ui/react-popover@^1.0.6
npm install @radix-ui/react-select@^2.1.6
npm install @radix-ui/react-toast@^1.1.4
npm install @radix-ui/react-tooltip@^1.1.4

# Utilitários
npm install clsx@^2.1.1 class-variance-authority@^0.7.1
npm install lucide-react@^0.475.0
npm install date-fns@^3.6.0

# Estado e Dados
npm install @tanstack/react-query@^5.71.5
npm install zustand@^5.0.3

# Formulários
npm install react-hook-form@^7.53.0
npm install @hookform/resolvers@^3.9.0
npm install zod@^3.24.2

# Backend (Supabase)
npm install @supabase/supabase-js@^2.50.0
npm install @supabase/ssr@^0.6.1

# Notificações
npm install sonner@^2.0.3
```

### 3. Dependências de Desenvolvimento

```bash
npm install --save-dev eslint-config-next@14.2.26
npm install --save-dev sharp@^0.34.2
```

---

## ⚙️ Arquivos de Configuração

### 1. next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // Adicione outros domínios conforme necessário
    ],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  compiler: {
    styledComponents: true
  },
  reactStrictMode: false
};

module.exports = nextConfig;
```

### 2. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 3. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Defina sua paleta de cores personalizada
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        // Cores do sistema Shadcn/ui
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4. components.json (Shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 5. .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "no-debugger": "error"
  }
}
```

### 6. postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 7. .gitignore

```
# Dependencies
node_modules/
.env
.env.*

# Next.js
.next/
out/

# Build
/dist/
/build/
public/build
.cache/

# Package managers
.npm/
.yarn/
yarn-error.log

# IDE
/.vscode/
/.idea/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# System Files
.DS_Store
Thumbs.db
```

---

## 🎨 Setup do Shadcn/ui

### 1. Inicialização

```bash
# Instalar CLI do Shadcn/ui
npx shadcn-ui@latest init

# Adicionar componentes essenciais
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
```

### 2. src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Defina suas variáveis CSS customizadas */
    --primary: #0D6759;
    --primary-foreground: #EDEBB9;
    --secondary: #329788;
    --secondary-foreground: #FFFFFF;
    
    /* Variáveis do sistema Shadcn/ui */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 3. src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 🏗️ Estrutura de Componentes

### 1. src/app/layout.tsx

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu Projeto",
  description: "Descrição do meu projeto",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 2. src/app/providers.tsx

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ 
  children
}: { 
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutos
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  );
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. src/app/page.tsx

```typescript
export default function HomePage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center">
        Bem-vindo ao Meu Projeto
      </h1>
      <p className="text-center mt-4 text-muted-foreground">
        Stack Next.js + React + TypeScript + Tailwind CSS
      </p>
    </main>
  );
}
```

---

## 🐳 Configuração Docker

### 1. Dockerfile

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

# Variáveis de ambiente para build
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Ambiente de produção
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Argumentos do build para produção
ARG NEXT_PUBLIC_SITE_URL

# Variáveis de ambiente para produção
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

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

### 2. docker-compose.yml

```yaml
version: '3'
services:
  meu-projeto:
    image: ghcr.io/seu-usuario/meu-projeto:latest
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - NEXT_PUBLIC_SITE_URL=https://meudominio.com
    ports:
      - "3000:3000"

networks:
  app-network:
    external: true
```

---

## 🚀 CI/CD com GitHub Actions

### .github/workflows/build-and-push.yml

```yaml
name: Docker Build and Publish

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/meu-projeto
  NEXT_PUBLIC_SITE_URL: https://meudominio.com

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
            NEXT_PUBLIC_SITE_URL=${{ env.NEXT_PUBLIC_SITE_URL }}

      - name: Logout from Container registry
        if: always()
        run: docker logout ${{ env.REGISTRY }}
```

---

## 🔧 Scripts Úteis

### package.json - Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .js,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next out dist",
    "docker:build": "docker build -t meu-projeto .",
    "docker:run": "docker run -p 3000:3000 meu-projeto"
  }
}
```

---

## 🌍 Variáveis de Ambiente

### .env.example

```bash
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (se usar)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Outras APIs
API_SECRET_KEY=your_api_secret
```

---

## 📚 Próximos Passos

### 1. Desenvolvimento

1. **Configure seu ambiente local**:
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Adicione suas páginas**:
   - Crie arquivos em `src/app/` seguindo o App Router
   - Use componentes do Shadcn/ui
   - Implemente seus hooks customizados

3. **Customize o design**:
   - Ajuste as variáveis CSS em `globals.css`
   - Modifique `tailwind.config.js` conforme sua marca
   - Adicione componentes personalizados

### 2. Produção

1. **Configure CI/CD**:
   - Ajuste o workflow do GitHub Actions
   - Configure secrets no repositório
   - Teste o build em ambiente de staging

2. **Deploy**:
   - Configure seu domínio
   - Ajuste variáveis de ambiente de produção
   - Monitore logs e performance

---

## 🎯 Benefícios desta Stack

### ✅ **Prós**

- **Performance**: Next.js 15 com App Router otimizado
- **Developer Experience**: TypeScript + ESLint + Hot Reload
- **UI Moderna**: Shadcn/ui com componentes acessíveis
- **Escalabilidade**: Arquitetura modular e componentizada
- **Deploy Automático**: CI/CD completo com Docker
- **Manutenibilidade**: Código tipado e bem estruturado

### ⚠️ **Considerações**

- **Curva de Aprendizado**: Requer conhecimento em React/Next.js
- **Complexidade Inicial**: Muitas configurações para projetos simples
- **Dependências**: Stack robusta com muitas dependências

### 🔄 **Efeitos Colaterais**

- **Bundle Size**: Pode ser maior devido aos componentes UI
- **Build Time**: Tempo de build pode aumentar com muitas dependências
- **Compatibilidade**: Sempre teste atualizações em ambiente de desenvolvimento

---

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de build TypeScript**:
   ```bash
   npm run type-check
   ```

2. **Problemas de CSS**:
   ```bash
   npm run build
   # Verifique conflitos no Tailwind
   ```

3. **Dependências desatualizadas**:
   ```bash
   npm audit
   npm update
   ```

---

## 📖 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)

---

**🎉 Parabéns!** Você agora tem uma stack completa e robusta para desenvolver aplicações modernas com Next.js, React e TypeScript.

> **Dica**: Mantenha este guia atualizado conforme evolui sua stack e adicione suas próprias convenções e padrões específicos do projeto.
