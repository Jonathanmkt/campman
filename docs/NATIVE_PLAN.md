# Plano Adaptado – Módulo Mobile Web (src/app/mobile + src/app/api/mobile)

## 1. Contexto e Escopo
- O mobile deixa de ser um app nativo separado e passa a viver **dentro do próprio monorepo `idealiscore`**, reaproveitando Next.js, shadcn/ui e convenções já estabelecidas.
- As páginas mobile ficarão em `src/app/mobile` (interface) e a camada de APIs específicas para onboarding/login em `src/app/api/mobile`.
- Objetivo geral: entregar experiência mobile-first para a campanha – incluindo criação de usuários via WhatsApp, onboarding simplificado e dashboards resumidos – sem alterar o fluxo atual do dashboard desktop.
- Continuamos usando Supabase para todo o CRUD, mantendo o RLS. O mobile **nunca comunica Supabase diretamente**: todas as operações passam por rotas em `src/app/api/mobile` (ou Edge Functions equivalentes) executando com `service_role`.
- Dashboard existente (rotas desktop) preserva autenticação atual; o módulo mobile terá autenticação paralela (telefone + senha) e tokens próprios, simulando “dois apps” em um único repositório.

## 2. Público-alvo e Perfis
- Perfis continuam: **Colaboradores**, **Coordenadores** e **Lideranças**.
- Após login mobile, cada perfil acessa apenas seus módulos dentro de `src/app/mobile`.
- **Referência visual:** reciclar componentes/fluxos existentes nas páginas de `src/app/mobile` (já usadas como mock) e nos dashboards do coordenador/liderança, adaptando para um layout mobile-first. A rota de Colaborador começa como placeholder “Em breve” para liberar o fluxo de permissões.

## 3. Objetivos do MVP
1. Expor visão mobile de candidatos, projetos e tarefas com dados resumidos e CTA rápidos.
2. Implementar autenticação própria (telefone + senha) totalmente independente do login do dashboard tradicional.
3. Permitir que usuários convidem outros via WhatsApp (uazapi), com deep link que pré-preenche telefone e redireciona para o fluxo de criação de senha.
4. Garantir infraestrutura de convites hierárquicos para escalar o time da campanha sem suporte manual.

## 4. Fluxo de Autenticação e Onboarding
- **Credenciais padrão:** telefone `DDDNXXXXXXXX` + senha definida no primeiro acesso.
- **Hierarquia de criação:** Colaboradores convidam Coordenadores, Coordenadores convidam Lideranças (ajustável conforme regras de negócio). Lideranças podem ser criadas manualmente pelo time central.
- **Convites via WhatsApp (uazapi):**
  - Endpoint `POST /api/mobile/invites` gera token vinculado a telefone e role.
  - Mensagem enviada com link curto `https://app.com/mobile/onboarding?token=...` e fallback deep link (`campanha://mobile/...`).
  - Ao abrir o link, a página em `src/app/mobile/onboarding` pré-carrega o telefone, valida o token e pede criação de senha.
- **Autocadastro:** rota dedicada (`/mobile/signup`) permite iniciar o fluxo sem convite. A aprovação ocorre após revisão ou automação com verificação de telefone (SMS futuro).
- **Infra Supabase necessária:** tabelas `usuarios`, `roles`, `convites` e demais entidades operacionais. Tokens expiram em minutos, armazenam status (pendente, aceito, expirado) e mantêm vínculo com quem convidou. Middleware central (em `src/app/api/mobile/_lib/auth`) valida role antes de qualquer CRUD.

## 5. Stack Tecnológica
- **Frontend:** Next.js (rotas em `/mobile`), React Server Components onde fizer sentido e shadcn/ui/NativeWind adaptados para mobile web. Manter tokens de design em `src/components/ui`.
- **Estado/dados:** `@tanstack/react-query` para requisições mobile, compartilhando hooks onde possível; Zustand para estados locais (ex.: wizard de onboarding).
- **Validação:** `zod`.
- **Backend:** Rotas em `src/app/api/mobile/*` (Route Handlers) e/ou Edge Functions no Supabase:
  - usam `@supabase/supabase-js` com `service_role`;
  - expõem endpoints `login`, `invite`, `complete-invite`, `resend`.
- **Qualidade:** mesma base do projeto (ESLint, Prettier, TypeScript strict, Vitest/Jest). Garantir `npm run generate-types`, `npm run type-check` e `npm run validate-endpoints` após qualquer alteração de schema.

## 6. Arquitetura e Estrutura de Pastas
```
src/
├── app/
│   ├── mobile/
│   │   ├── layout.tsx              # Shell mobile + provedor de auth
│   │   ├── page.tsx                # landing / redirecionamento por role
│   │   ├── onboarding/             # fluxo de convite/autocadastro
│   │   ├── login/                  # telefone + senha
│   │   ├── colaboradores/...
│   │   ├── coordenadores/...
│   │   └── liderancas/...
│   └── api/
│       └── mobile/
│           ├── auth/login/route.ts
│           ├── auth/complete-invite/route.ts
│           ├── invites/route.ts
│           └── ...
├── components/
│   ├── ui/                         # shadcn/ui adaptado para mobile
│   └── mobile/                     # componentes específicos por página
├── lib/
│   ├── auth-mobile.ts              # helpers JWT interno, cookies, etc.
│   ├── invite-links.ts             # geração de links/deep links
│   └── whatsapp-uazapi.ts          # client para disparos
├── services/
│   └── supabase-mobile.ts          # client service_role
└── types/
    └── index.ts                    # importar de @/types (Supabase)
```

## 7. Backlog Ordenado (dependências)
1. **Fundação Mobile**
   - Criar estrutura `src/app/mobile` com layout próprio e suporte a autenticação independente.
   - Configurar providers (React Query + Zustand) carregados apenas nas rotas mobile.
2. **Camada de APIs Mobile**
   - Implementar rotas em `src/app/api/mobile/auth/*` e `invites`.
   - Centralizar helpers de assinatura/verificação de tokens e chamadas `service_role`.
3. **Modelagem Supabase**
   - Revisar/ajustar tabelas `usuarios`, `roles`, `convites` garantindo campos: `telefone`, `role`, `token`, `status`, `expires_at`, `created_by`.
   - Atualizar RLS e rodar `npm run generate-types`, `npm run type-check`, `npm run validate-endpoints`.
4. **Fluxo de Convites**
   - Criar tela de geração de convite (coordenador/liderança) com envio via uazapi.
   - Adicionar auditoria (histórico de convites) e ações de reenviar/cancelar.
5. **Onboarding/Web Login**
   - Construir wizard em `/mobile/onboarding` seguindo etapas: validar token → confirmar telefone → criar senha → login automático.
   - Desenvolver `/mobile/login` para retornos futuros (telefone + senha).
6. **UI por Perfil**
   - Definir tokens mobile em `src/components/ui`.
   - Reaproveitar dashboards existentes adaptando para layout responsivo mobile-first.
   - Manter placeholder “Em breve” para Colaborador no MVP, com CTA para entrar em contato.
7. **Automação/Observabilidade**
   - Documentar prompts/playbooks para Windsurf/Copilot auxiliando na criação rápida de cards/tabelas mobile.
   - Instrumentar logs (p. ex. Sentry) específicos do módulo mobile para monitorar convites e falhas de login.

## 8. Dependências Externas
- Supabase (auth, dados, storage, Edge Functions).
- APIs CEPESP/TSE via backend atual (consumidas pelas rotas internas).
- uazapi (WhatsApp) para disparo automático de convites com deep links.
- (Opcional) serviço de SMS como fallback para verificação de telefone.

## 9. Riscos e Mitigações
- **Divergência de schema entre dashboard e mobile:** padronizar todas as tipagens via `@/types` e executar `npm run generate-types` sempre que o Supabase mudar.
- **Instabilidade uazapi:** prever reenvio manual e fallback (SMS/e-mail); monitorar limites da API.
- **Tokens de convite vazados:** tokens vinculados a telefone, uso único, expiração curta e invalidação após primeira autenticação.
- **Autenticação paralela confusa:** comunicar claramente que dashboard (desktop) continua com login atual; mobile usa telefone + senha. Documentar flows em `docs/architecture.md`.
- **Experiência mobile negligenciada:** revisar design tokens e criar componentes dedicados para garantir performance/responsividade.

## 10. Próximos Passos Imediatos
1. Criar `docs/architecture.md` detalhando fluxo de convites, APIs mobile e separação de autenticação.
2. Subir skeleton de `src/app/mobile` + providers e verificar roteamento protegido.
3. Implementar rotas `POST /api/mobile/auth/login` e `POST /api/mobile/invites` com testes básicos.
4. Configurar integração inicial com uazapi (mock/local até credenciais oficiais).
5. Definir milestones: 
   - **MVP-1:** login telefone+senha + placeholder Colaborador;
   - **MVP-2:** dashboards Coordenador/Liderança com convites operacionais;
   - **MVP-3:** métricas avançadas e automações adicionais.
