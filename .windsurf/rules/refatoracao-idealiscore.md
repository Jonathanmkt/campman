# IDEALIS CORE — Plano Macro de Refatoração para Multi-Tenant SaaS

> **Início:** 12 de fevereiro de 2026
> **Projeto Supabase:** `xkqtrwbnionpbjziilgy` (nome atual: "Thiago Moura" → será renomeado para "Idealis Core")
> **Repositório atual:** `campanha-thiago-moura` → será renomeado para `IdealisCore`
> **URL de produção:** `app.idealiscore.com.br`
> **Nome na interface:** Idealis Core
> **Status:** EM ANDAMENTO

---

## Contexto

O Idealis Core nasceu como ferramenta de gestão de campanha política para um único candidato (Thiago Moura, RJ). Após validação, outros candidatos a deputado estadual e federal de diversos estados do Brasil demonstraram interesse. O projeto será transformado em um **SaaS multi-tenant** (multi-inquilino), onde cada "tenant" é uma **campanha** com seu próprio admin, equipe, configurações visuais e restrição geográfica por estado.

**Termo técnico correto:** O modelo é **Multi-Tenant SaaS** (Software as a Service com múltiplos inquilinos). Cada "tenant" = uma campanha. O isolamento de dados entre campanhas será feito via **tenant_id** (coluna `campanha_id`) em todas as tabelas, usando **Row Level Security (RLS)** do Supabase para garantir que cada usuário só veja dados da sua campanha.

---

## Glossário de Termos Técnicos

| Termo | Significado simples |
|---|---|
| **Multi-Tenant** | Um único sistema serve vários "donos" (campanhas), cada um isolado |
| **Tenant** | Cada campanha/candidato é um "inquilino" do sistema |
| **RLS (Row Level Security)** | Regra no banco que filtra dados automaticamente por campanha |
| **Onboarding** | Fluxo de primeira configuração quando o admin cria a conta |
| **RBAC (Role-Based Access Control)** | Controle de acesso baseado em papéis (admin, coordenador, liderança, etc.) |
| **Schema Migration** | Alteração estrutural no banco de dados (criar/alterar tabelas) |
| **QR Code Deep Link** | QR Code que leva direto para uma tela específica do app |
| **AAB (Android App Bundle)** | Formato de publicação de apps Android na Play Store |

---

## Ordem de Execução (por Dependência)

As etapas estão ordenadas de forma que **cada etapa só depende de etapas anteriores já concluídas**.

---

### FASE 1 — FUNDAÇÃO (Pré-requisitos para tudo)

#### ETAPA 1.1 — Renomeação e Desacoplamento de Identidade
- [x] **1.1.1** Renomear referências no código de `campman`/`CampMan` para `idealiscore`/`Idealis Core`
- [x] **1.1.2** Renomear diretório do projeto de `campanha-thiago-moura` para `IdealisCore` *(pendente renomear pasta local)*
- [x] **1.1.3** Atualizar remote do Git para o novo nome do repositório (`IdealisCore`)
- [x] **1.1.4** Remover referências hardcoded a "Thiago Moura" no código-fonte:
  - `src/components/layout/Sidebar.tsx` (linha 98: "Thiago Moura", linha 100: "Campanha 2026")
  - `src/app/mobile/(app)/liderancas/components/NovaLiderancaForm.tsx`
  - `src/app/mobile/(app)/liderancas/hooks/useLiderancas.ts`
  - `src/components/gestao-projetos/analytics/ProjectAnalytics.tsx`
  - `src/components/gestao-projetos/gantt/SimpleGanttChart.tsx`
  - `src/components/layout/UserProfile.tsx`
- [x] **1.1.5** Substituir textos estáticos por placeholders genéricos com TODO (dados dinâmicos dependem da Etapa 1.2)
- [x] **1.1.6** Renomear projeto no Supabase de "Thiago Moura" para "Idealis Core" *(pendente via dashboard Supabase)*
- [x] **1.1.7** Limpar arquivos de debug/teste da raiz do projeto (`.html`, `.json` de Araruama, `.ps1`, `.py`)

> **Dependência:** Nenhuma. Esta é a primeira etapa.

---

#### ETAPA 1.2 — Modelagem Multi-Tenant no Banco de Dados
- [x] **1.2.1** Criar tabela `campanha` (tenant principal):
  ```
  campanha {
    id: uuid (PK)
    nome: text (nome da campanha)
    nome_candidato: text
    cargo_pretendido: text (enum: deputado_estadual, deputado_federal, vereador, prefeito, senador, governador)
    partido: text
    numero_candidato: text
    uf: text (2 chars — sigla do estado, ex: "RJ", "SP")
    cidade: text (nullable — apenas para cargos municipais)
    foto_candidato_url: text (avatar do candidato)
    foto_capa_desktop_url: text
    foto_capa_mobile_url: text
    tema_cores: text (enum de temas pré-definidos, default: 'azul')
    status: text (enum: ativa, pausada, encerrada)
    created_at: timestamptz
    updated_at: timestamptz
  }
  ```
- [x] **1.2.2** Criar tabela `campanha_membro` (vínculo usuário ↔ campanha):
  ```
  campanha_membro {
    id: uuid (PK)
    campanha_id: uuid (FK → campanha.id)
    profile_id: uuid (FK → profiles.id)
    role: text (enum: admin, colaborador, coordenador, lideranca, eleitor)
    convidado_por: uuid (FK → profiles.id, nullable)
    status: text (enum: ativo, inativo, pendente)
    created_at: timestamptz
    updated_at: timestamptz
    UNIQUE(campanha_id, profile_id)
  }
  ```
- [x] **1.2.3** Adicionar coluna `campanha_id` (uuid, FK → campanha.id) em TODAS as tabelas de dados existentes:
  - `profiles` (adicionar campo, mas manter sem NOT NULL inicialmente para migração)
  - `municipio`
  - `area`
  - `lideranca`
  - `eleitor`
  - `coordenador_regional`
  - `coordenador_regional_municipio`
  - `colaborador`
  - `convites`
  - `evento`
  - `equipe`
  - `departamento`
  - `pesquisa_quantitativa`
  - `projects`, `tasks`, `sprints`, `milestones` (gestão de projetos)
- [x] **1.2.4** Criar migration para popular dados existentes com uma `campanha_id` default (campanha legada)
- [x] **1.2.5** Tornar `campanha_id` NOT NULL em todas as tabelas após migração de dados
- [x] **1.2.6** Implementar **RLS (Row Level Security)** em todas as tabelas:
  - Policy: `SELECT/INSERT/UPDATE/DELETE WHERE campanha_id = (SELECT campanha_id FROM campanha_membro WHERE profile_id = auth.uid() LIMIT 1)`
  - Habilitar RLS em tabelas que ainda não têm (atualmente `profiles`, `municipio`, `area`, `lideranca`, `eleitor`, `coordenador_regional`, `colaborador` estão com RLS **desabilitado**)
- [x] **1.2.7** Regenerar tipos TypeScript (`npm run generate-types`) após todas as migrations
- [x] **1.2.8** Preparar estrutura para monetização futura: adicionar campos como `plano`, `limite_eleitores`, `data_expiracao_plano` (ou tabela auxiliar `campanha_plano` caso necessário), mesmo que ainda não haja cobrança ativa. Todas as migrations já devem contemplar esses metadados para evitar retrabalho.

> **Dependência:** Etapa 1.1 (renomeação) deve estar concluída para evitar conflitos.

---

#### ETAPA 1.3 — Role "Admin" e Sistema RBAC Atualizado
- [ ] **1.3.1** Adicionar role `admin` ao check constraint da coluna `roles` em `profiles`
- [ ] **1.3.2** Atualizar `src/lib/supabase/middleware.ts`:
  - Adicionar `admin` ao tipo `UserRole`
  - Definir rota padrão do admin: `/dashboard` (com acesso total)
  - Admin pode acessar todas as rotas do dashboard
- [ ] **1.3.3** Atualizar `src/middleware.ts` para considerar rotas de onboarding do admin
- [ ] **1.3.4** Criar lógica de hierarquia de convites:
  - **Admin** pode convidar: colaboradores, coordenadores, lideranças, eleitores
  - **Coordenador** pode convidar: lideranças
  - **Liderança** pode convidar: eleitores
  - Todos os convites passam a incluir `campanha_id`
- [ ] **1.3.5** Atualizar tabela `convites`:
  - Adicionar `campanha_id` (FK → campanha.id)
  - Expandir check constraint de `role` para incluir `admin` e `eleitor`
- [ ] **1.3.6** Atualizar componente Sidebar para exibir dados dinâmicos da campanha (nome do candidato, foto, nome da campanha) em vez de texto hardcoded

> **Dependência:** Etapa 1.2 (tabelas `campanha` e `campanha_membro` devem existir).

---

### FASE 2 — ONBOARDING E CONFIGURAÇÃO

#### ETAPA 2.1 — Fluxo de Onboarding do Admin
- [ ] **2.1.1** Criar página `/auth/signup-admin` — cadastro do admin (email + senha ou telefone)
- [ ] **2.1.2** Criar fluxo de onboarding multi-step (`/onboarding/admin`):
  - **Step 1:** Nome da campanha + Nome do candidato + Cargo pretendido + Partido + Número
  - **Step 2:** Seleção do estado (UF) — **irreversível** — lista dos 26 estados + DF
  - **Step 3:** Upload de fotos (avatar do candidato, capa desktop, capa mobile)
  - **Step 4:** Placeholder para tema de cores (a escolha real acontecerá somente na Etapa 2.2, após a Fase 3)
  - **Step 5:** Confirmação e criação da campanha
- [ ] **2.1.3** Ao finalizar onboarding:
  - Criar registro em `campanha`
  - Criar registro em `campanha_membro` (role: admin)
  - Configurar Storage bucket no Supabase para assets da campanha
- [ ] **2.1.4** Criar tela de configurações da campanha (`/dashboard/configuracoes`) para edição posterior (tudo exceto UF, que é irreversível)

> **Dependência:** Etapa 1.3 (role admin e RBAC devem estar funcionando).

---

#### ETAPA 2.2 — Sistema de Temas e Cores (AGENDADA PARA DEPOIS DA FASE 3)
- [ ] **2.2.1** Implementar modo híbrido: (a) presets com 6-8 paletas bem definidas (azul-institucional, verde-esperança, vermelho-social, amarelo-liberal, roxo-moderno, laranja-energia etc.) e (b) modo avançado para ajustes manuais de cada cor.
- [ ] **2.2.2** Cada preset e ajuste deve mapear para variáveis CSS (`--primary`, `--secondary`, `--accent`, `--background`, `--foreground`) respeitando o design system shadcn/Tailwind.
- [ ] **2.2.3** Carregar tema da campanha no `layout.tsx` do dashboard e replicar nos convites/telas mobile somente após finalização desta etapa.
- [ ] **2.2.4** Validar UX após implementação para decidir se mantemos apenas presets, apenas manual ou o híbrido (default atual).

> **Dependência:** Etapas 2.1 **e 3.1** (somente iniciar após concluirmos a parametrização por estado).
> **Nota:** Agendada explicitamente para pós-Fase 3 conforme decisão de 12/02/2026.

---

### FASE 3 — GEORREFERENCIAMENTO DINÂMICO

#### ETAPA 3.1 — Remoção do Hardcode "Rio de Janeiro" e Parametrização por UF
- [ ] **3.1.1** Criar constante/config com coordenadas centrais e bounds de cada um dos 27 estados brasileiros (26 UFs + DF)
- [ ] **3.1.2** Refatorar `src/app/dashboard/areas/components/GoogleMap.tsx`:
  - Remover fallback hardcoded `{ lat: -22.6140, lng: -42.6406 }` (centro do RJ)
  - Remover verificação de distância do RJ (linhas 59-73)
  - Buscar UF da campanha do usuário logado e usar coordenadas centrais do estado correspondente
- [ ] **3.1.3** Refatorar `src/app/dashboard/areas/components/MapSearch.tsx`:
  - Remover append hardcoded `', Rio de Janeiro, RJ, Brasil'` (linha 60)
  - Substituir por `', {nome_estado}, {uf}, Brasil'` dinâmico baseado na campanha
- [ ] **3.1.4** Refatorar `src/app/api/geocode/route.ts`:
  - Aceitar parâmetro `uf` para filtrar resultados por estado
  - Adicionar `administrative_area_level_1` ao component filter do Google Geocoding
- [ ] **3.1.5** Atualizar default da coluna `area.estado` de `'RJ'::text` para valor dinâmico baseado na campanha
- [ ] **3.1.6** Refatorar hooks e componentes de coordenadores/lideranças que usam georreferenciamento para usar UF da campanha

> **Dependência:** Etapa 1.2 (tabela `campanha` com campo `uf` deve existir) + Etapa 2.1 (admin deve ter configurado o estado).

---

### FASE 4 — SISTEMA DE CONVITES EXPANDIDO

#### ETAPA 4.1 — Convites via Telefone para Todos os Roles
- [ ] **4.1.1** Configurar Supabase Auth para login via telefone (Phone OTP) — verificar se já está habilitado
- [ ] **4.1.2** Implementar fluxo de convite do Admin:
  - Admin convida Colaborador → via telefone → WhatsApp com link de onboarding
  - Admin convida Coordenador → via telefone → WhatsApp com link de onboarding
  - Admin convida Liderança → via telefone → WhatsApp com link de onboarding
  - Admin convida Eleitor → via telefone → WhatsApp com link de cadastro
- [ ] **4.1.3** Atualizar tabela `convites` para suportar todos os roles e incluir `campanha_id`
- [ ] **4.1.4** Criar tela de gestão de convites no dashboard do admin (`/dashboard/convites`)
- [ ] **4.1.5** Integrar a **WhatsApp Business Platform (API oficial do WhatsApp)**: estudar autenticação (Bearer Token), configuração de Cloud API no Facebook Business Manager, e registrar os números oficiais da campanha.
- [ ] **4.1.6** Definir e aprovar templates de mensagem (categoria utility/marketing) para convites, contendo placeholders de nome e link de onboarding.
- [ ] **4.1.7** Manter fluxo existente de convite Liderança → Eleitor funcionando com `campanha_id` e migrar o envio desses convites para os mesmos templates oficiais quando aplicável.

> **Dependência:** Etapa 1.3 (RBAC com role admin) + Etapa 1.2 (campanha_id nos convites).

---

#### ETAPA 4.2 — QR Codes para Captação de Eleitores
- [ ] **4.2.1** Criar tabela `qr_code_campanha`:
  ```
  qr_code_campanha {
    id: uuid (PK)
    campanha_id: uuid (FK → campanha.id)
    codigo: text (UNIQUE — identificador curto para URL)
    tipo_origem: text (enum: evento, publicidade, rede_social, panfleto, outro)
    nome_origem: text (ex: "Comício Praça Central", "Panfleto Bairro X")
    descricao: text (nullable)
    url_destino: text (URL completa gerada automaticamente)
    total_escaneamentos: integer (default 0)
    total_cadastros: integer (default 0)
    ativo: boolean (default true)
    created_at: timestamptz
    created_by: uuid (FK → profiles.id)
  }
  ```
- [ ] **4.2.2** Criar rota pública `/convite/[codigo]` que:
  - Identifica a campanha pelo código do QR
  - Exibe tela de cadastro de eleitor (sem necessidade de login prévio)
  - Registra origem (evento/publicidade) para CRM
  - Incrementa contadores de escaneamento/cadastro
- [ ] **4.2.3** Criar gerador de QR Codes no dashboard do admin (`/dashboard/qr-codes`)
  - Usar biblioteca `qrcode` ou `react-qr-code` para gerar QR codes
  - Permitir download em PNG/SVG para impressão
  - Exibir métricas de cada QR Code (escaneamentos, cadastros, taxa de conversão)
- [ ] **4.2.4** Integrar dados de origem do QR Code no CRM/relatórios de eleitores

> **Dependência:** Etapa 4.1 (sistema de convites expandido deve estar funcionando).

---

### FASE 5 — APLICATIVO NATIVO (React Native)

#### ETAPA 5.1 — Criação do Projeto React Native
- [ ] **5.1.1** Criar novo repositório `idealiscore-mobile` usando **React Native com Expo** (workflow padrão Expo para acelerar builds e publicação)
- [ ] **5.1.2** Configurar integração com Supabase (auth, database, storage)
- [ ] **5.1.3** Migrar telas mobile existentes de Next.js (`src/app/mobile/`) para React Native:
  - Tela de login (Phone OTP)
  - Tela de onboarding mobile
  - Tela de lideranças (listagem, cadastro, detalhes)
  - Tela de eleitores (listagem, cadastro, detalhes)
  - Tela de perfil
- [ ] **5.1.4** Adaptar componentes de UI para React Native (substituir shadcn por equivalentes nativos como NativeWind + componentes customizados ou React Native Paper)
- [ ] **5.1.5** Implementar navegação nativa (React Navigation)
- [ ] **5.1.6** Integrar Google Maps nativo (`react-native-maps`)
- [ ] **5.1.7** Implementar push notifications (Firebase Cloud Messaging)
- [ ] **5.1.8** Gerar AAB (Android) e IPA (iOS)
- [ ] **5.1.9** Publicar na Play Store e Apple Store

> **Dependência:** Fases 1-4 devem estar concluídas (o app nativo consome a mesma API/banco multi-tenant).
> **Nota:** Esta fase é um **projeto separado** e pode ser desenvolvida em paralelo a partir da Fase 3, desde que a API esteja estável.

---

### FASE 6 — LIMPEZA E HARDENING

#### ETAPA 6.1 — Segurança e Performance
- [ ] **6.1.1** Auditar todas as RLS policies com `mcp0_get_advisors` (security)
- [ ] **6.1.2** Auditar performance com `mcp0_get_advisors` (performance)
- [ ] **6.1.3** Criar índices compostos em todas as tabelas para `campanha_id` + campos de busca frequente
- [ ] **6.1.4** Implementar rate limiting nas APIs de convite e QR Code
- [ ] **6.1.5** Testes de isolamento multi-tenant (garantir que campanha A não vê dados da campanha B)
- [ ] **6.1.6** Remover página temporária `/convites-pendentes` (será substituída pelo dashboard de convites)
- [ ] **6.1.7** Remover rotas e componentes mobile do Next.js após migração para React Native

> **Dependência:** Todas as fases anteriores.

---

## Decisões Registradas em 12/02/2026

1. **Temas de cores:** Executar somente após a Fase 3 e implementar abordagem híbrida (presets + ajustes manuais).
2. **Envio de convites:** Usaremos exclusivamente a **API oficial do WhatsApp Business** (nada de Twilio/uazapi). Precisamos estudar configuração, templates e limites.
3. **Aplicativo nativo:** Projeto React Native será desenvolvido com **Expo**.
4. **Cobrança futura:** Já criaremos campos/tabelas para suportar planos, limites e datas de expiração, mesmo sem cobrar agora (Etapa 1.2.8).

## Decisões Registradas em 13/02/2026

5. **Rebranding:** Projeto renomeado de CampMan para **Idealis Core**. URL: `app.idealiscore.com.br`. Repositório: `IdealisCore`. Nome na interface: "Idealis Core". Repositório mobile: `idealiscore-mobile`.

---

## Regras para Agentes de IA durante a Refatoração

1. **Sempre consultar este arquivo** antes de iniciar qualquer tarefa relacionada ao Idealis Core
2. **Nunca alterar tabelas do banco** sem antes verificar o checklist acima e confirmar que a etapa anterior está concluída
3. **Sempre usar `campanha_id`** em qualquer nova query, insert, update ou delete
4. **Nunca hardcodar** nomes de candidatos, estados, coordenadas ou cores
5. **Sempre regenerar tipos** (`npm run generate-types`) após qualquer migration
6. **Manter compatibilidade** com dados existentes durante migrations (nunca perder dados)
7. **Testar RLS** após cada policy criada (verificar isolamento entre campanhas)
8. **Marcar checkbox** neste arquivo ao concluir cada sub-etapa
9. **O projeto Supabase é:** `xkqtrwbnionpbjziilgy`
10. **Stack obrigatória:** Next.js 15, React 19, TypeScript, Supabase, shadcn/ui, Tailwind CSS 3.4, TanStack Query, Zustand, react-hook-form, Zod
11. **Nome do projeto na interface:** Idealis Core (sempre com espaço, duas palavras)
12. **Nome técnico (repos, Docker, configs):** idealiscore (tudo junto, minúsculo)
13. **URL de produção:** app.idealiscore.com.br

---

## Histórico de Progresso

| Data | Etapa | Status | Observações |
|---|---|---|---|
| 2026-02-12 | Planejamento | ✅ Concluído | Plano macro criado e persistido como workspace rule |
| 2026-02-13 | Rebranding CampMan → Idealis Core | ✅ Concluído | Todas as referências no código atualizadas (package.json, docker-compose, GH Actions, layouts, mobile, dashboard, roadmap, types, docs) |
| | | | |
