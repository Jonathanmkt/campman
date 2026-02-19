# Fluxo Completo: Checkout → Onboarding → Dashboard

> **Última atualização:** 2026-02-19  
> **Status:** ✅ Validado em produção (`app.idealiscore.com.br`)  
> **Autor:** Equipe Idealis Core

---

## Visão Geral

Este documento descreve em detalhes **todo o fluxo de dados** desde o momento em que um cliente preenche o formulário de checkout até o primeiro acesso autenticado ao painel da plataforma. O objetivo é permitir que qualquer desenvolvedor futuro entenda o sistema sem precisar explorar o código do zero.

---

## Diagrama do Fluxo

```
[Cliente] → /checkout
     │
     ▼
POST /api/pagarme/checkout
     │  Cria pedido na Pagar.me
     │  Salva registro em public.pedidos (status: pending)
     ▼
[Pagar.me] → Página de pagamento hospedada
     │
     ▼
[Cliente paga] (cartão/PIX/boleto)
     │
     ▼
POST /api/webhooks/pagarme  ← Pagar.me chama automaticamente
     │  Valida Basic Auth
     │  Evento: order.paid
     │  Atualiza pedidos.status = 'paid'
     │  Chama inviteAdmin()
     ▼
Supabase Auth → inviteUserByEmail()
     │  Cria auth.users (status: invited)
     │  Trigger on_auth_user_created → cria public.profiles
     │  Envia email via SMTP customizado (HostGator)
     ▼
[Cliente] → Recebe email com link
     │  Link: https://app.idealiscore.com.br/auth/confirm
     │        ?token_hash=XXX&type=invite&next=/onboarding/admin
     ▼
GET /auth/confirm
     │  supabase.auth.verifyOtp({ token_hash, type: 'invite' })
     │  Sessão criada ✅
     │  Redireciona para ?next= → /onboarding/admin
     ▼
/onboarding/admin  (5 steps)
     │  Step 1: Define senha
     │  Step 2: Dados da campanha
     │  Step 3: Escolha do estado (UF) — irreversível
     │  Step 4: Tema (placeholder)
     │  Step 5: Confirmação → handleSubmit()
     │
     │  handleSubmit():
     │    1. supabase.auth.updateUser({ password })
     │    2. INSERT campanha
     │    3. INSERT campanha_membro (role: admin)
     │    4. UPDATE profiles SET campanha_id
     │    5. INSERT assinatura
     ▼
router.push('/dashboard')  ← Primeiro acesso autenticado
```

---

## Detalhamento por Etapa

### 1. Formulário de Checkout (`/checkout`)

**Arquivo:** `src/app/checkout/page.tsx`  
**O que acontece:**
- Cliente seleciona o plano (Básico R$99 / Profissional R$199)
- Preenche nome completo, email e CPF
- Clica em "Ir para Pagamento"

**Chamada de API:**
```
POST /api/pagarme/checkout
Body: { customer: { name, email, cpf }, items: [{ id, description, amount, quantity }] }
```

**Arquivo:** `src/app/api/pagarme/checkout/route.ts`  
**O que acontece no servidor:**
1. Cria pedido na API Pagar.me v5 (`POST https://api.pagar.me/core/v5/orders`)
2. Salva registro em `public.pedidos` com status `pending`
3. Retorna `{ checkoutUrl }` — URL da página de pagamento Pagar.me
4. Frontend redireciona o cliente para essa URL

**Tabela afetada:** `public.pedidos`
```sql
INSERT INTO pedidos (codigo, email, nome, status, plano_slug, plano_nome, valor,
                     meio_pagamento, pagarme_order_id, created_at)
VALUES (...)
```

---

### 2. Pagamento na Pagar.me

O cliente é redirecionado para a página de pagamento hospedada pela Pagar.me. Nenhuma lógica do Idealis Core é executada nessa etapa. Após o pagamento, a Pagar.me redireciona o cliente para `/payment/success?orderId=xxx`.

---

### 3. Webhook Pagar.me (`POST /api/webhooks/pagarme`)

**Arquivo:** `src/app/api/webhooks/pagarme/route.ts`

**Autenticação:** Basic Auth (usuário/senha configurados em `.env` e no painel Pagar.me)

**Eventos tratados:**
| Evento | Ação |
|--------|------|
| `order.paid` | Atualiza pedido para `paid` + dispara convite |
| `order.payment_failed` | Atualiza pedido para `failed` |
| `order.canceled` | Atualiza pedido para `canceled` |
| `charge.*` | Log apenas |

**Fluxo do evento `order.paid`:**
1. Extrai `customer.email`, `customer.name`, `items[0]` do payload
2. Determina `plano_slug` pelo nome do item (`basico` / `profissional` / `cortesia`)
3. Atualiza `pedidos.status = 'paid'` e `webhook_recebido_em = now()`
4. Chama `inviteAdmin({ email, nome, planoTipo, origemConvite, pagarmeChargeId })`
5. Atualiza `pedidos.convite_enviado_em = now()`

**Variáveis de ambiente necessárias:**
```env
PAGARME_WEBHOOK_USER=idealiscore_webhook_user
PAGARME_WEBHOOK_PASSWORD=senha_segura
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xkqtrwbnionpbjziilgy.supabase.co
NEXT_PUBLIC_SITE_URL=https://app.idealiscore.com.br
```

---

### 4. Envio do Convite (`inviteAdmin`)

**Arquivo:** `src/lib/services/invite-admin.ts`

```typescript
await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${siteUrl}/auth/confirm?next=/onboarding/admin`,
  data: {
    role: 'admin',
    plano_tipo: 'pago',
    origem_convite: 'pagarme_webhook',
    pagarme_charge_id: chargeId,
  },
})
```

**O que o Supabase faz internamente:**
1. Cria registro em `auth.users` com status `invited`
2. Armazena `user_metadata` com os campos `data` passados acima
3. Dispara o trigger `on_auth_user_created` → cria `public.profiles` automaticamente
4. Envia email via SMTP configurado (HostGator) usando o template `supabase/templates/invite.html`

**Trigger no banco:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

A função `handle_new_user()` insere em `public.profiles`:
```sql
INSERT INTO public.profiles (id, nome_completo, roles, campanha_id)
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ARRAY['admin'], NULL)
ON CONFLICT (id) DO NOTHING;
```

> **Nota:** `campanha_id` é `NULL` neste momento — será preenchido no onboarding.

---

### 5. Email de Convite

**Template:** `supabase/templates/invite.html`

O link no email usa o fluxo **PKCE com token_hash** (não o fluxo implícito com `#access_token`):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/onboarding/admin">
  Acessar minha conta →
</a>
```

**Por que esse formato?**  
O fluxo com `token_hash` é processado no servidor (`/auth/confirm`) via `verifyOtp()`. O fluxo implícito (`#access_token`) usa fragment hash que não é enviado ao servidor — por isso o `/auth/oauth` não funcionava.

---

### 6. Confirmação do Token (`/auth/confirm`)

**Arquivo:** `src/app/auth/confirm/route.ts`

```typescript
const { error } = await supabase.auth.verifyOtp({
  type: 'invite',       // vem do ?type= na URL
  token_hash: 'XXX',   // vem do ?token_hash= na URL
})
// Se OK → redirect(next) → /onboarding/admin
```

Após `verifyOtp` bem-sucedido:
- Sessão Supabase criada no cookie do browser
- Usuário autenticado ✅
- Redirecionado para `/onboarding/admin`

---

### 7. Onboarding do Admin (`/onboarding/admin`)

**Arquivo:** `src/app/onboarding/admin/page.tsx`  
**Hook:** `src/app/onboarding/admin/hooks/useOnboardingAdmin.ts`

**5 Steps:**

| Step | Conteúdo | Validação |
|------|----------|-----------|
| 1 | Definição de senha (mín. 6 chars) | Senha e confirmação iguais |
| 2 | Nome da campanha, candidato, cargo, partido, número | Nome campanha + candidato + cargo obrigatórios |
| 3 | Estado (UF) — irreversível, com confirmação explícita | UF selecionada + confirmada |
| 4 | Tema de cores (placeholder — em breve) | Sempre válido |
| 5 | Revisão de todos os dados | Sempre válido |

**Submit (`handleSubmit`):**

```typescript
// 1. Definir senha
await supabase.auth.updateUser({ password })

// 2. Criar campanha
const { data: campanha } = await supabase.from('campanha').insert({
  nome, nome_candidato, cargo_pretendido, partido, numero_candidato, uf, cidade, status: 'ativa'
}).select('id').single()

// 3. Criar vínculo admin
await supabase.from('campanha_membro').insert({
  campanha_id: campanha.id, profile_id: user.id, role: 'admin', status: 'ativo'
})

// 4. Atualizar profile
await supabase.from('profiles').update({ campanha_id: campanha.id, roles: ['admin'] }).eq('id', user.id)

// 5. Criar assinatura
await supabase.from('assinatura').insert({
  campanha_id: campanha.id, plano_id, status: 'ativa', ciclo: 'mensal', data_inicio
})

// 6. Redirecionar
router.push('/dashboard')
```

---

### 8. Middleware e Proteção de Rotas

**Arquivo:** `src/lib/supabase/middleware.ts`

Após o onboarding, o middleware verifica em cada requisição:
1. Sessão válida? → Se não: redireciona para `/auth/login`
2. É admin sem `campanha_id`? → Redireciona para `/onboarding/admin`
3. É admin com `campanha_id`? → Acesso liberado ao `/dashboard`

```typescript
if (!user) redirect('/auth/login')
if (primaryRole === 'admin' && !profile?.campanha_id) redirect('/onboarding/admin')
```

---

## Tabelas Afetadas (em ordem cronológica)

| Ordem | Tabela | Operação | Quando |
|-------|--------|----------|--------|
| 1 | `public.pedidos` | INSERT | Ao criar checkout |
| 2 | `public.pedidos` | UPDATE (status=paid) | Ao receber webhook |
| 3 | `auth.users` | INSERT | Ao enviar convite |
| 4 | `public.profiles` | INSERT (via trigger) | Automaticamente após auth.users |
| 5 | `public.pedidos` | UPDATE (convite_enviado_em) | Após convite enviado |
| 6 | `auth.users` | UPDATE (password) | Step 1 do onboarding |
| 7 | `public.campanha` | INSERT | Step 5 do onboarding |
| 8 | `public.campanha_membro` | INSERT | Step 5 do onboarding |
| 9 | `public.profiles` | UPDATE (campanha_id) | Step 5 do onboarding |
| 10 | `public.assinatura` | INSERT | Step 5 do onboarding |

---

## Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xkqtrwbnionpbjziilgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Nunca expor no frontend

# Site
NEXT_PUBLIC_SITE_URL=https://app.idealiscore.com.br

# Pagar.me
PAGARME_SECRET_KEY=sk_live_...     # sk_test_... em dev
PAGARME_PUBLIC_KEY=pk_live_...
PAGARME_WEBHOOK_USER=idealiscore_webhook_user
PAGARME_WEBHOOK_PASSWORD=senha_segura
```

---

## Configurações no Supabase Dashboard

### Authentication → URL Configuration
- **Site URL:** `https://app.idealiscore.com.br`
- **Redirect URLs:** `https://app.idealiscore.com.br/**`

### Authentication → SMTP Settings
- **Host:** `idealiscore.com.br`
- **Port:** `465` (SSL)
- **User:** `nao-responda@idealiscore.com.br`
- **From:** `nao-responda@idealiscore.com.br`
- **From Name:** `Idealis Core`

### Authentication → Email Templates → Invite User
- Template customizado em `supabase/templates/invite.html`
- Link usa `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/onboarding/admin`

---

## Arquivos-Chave do Fluxo

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/checkout/page.tsx` | Formulário de checkout |
| `src/app/api/pagarme/checkout/route.ts` | Cria pedido na Pagar.me |
| `src/app/api/webhooks/pagarme/route.ts` | Recebe eventos da Pagar.me |
| `src/lib/services/invite-admin.ts` | Envia convite via Supabase Admin API |
| `supabase/templates/invite.html` | Template HTML do email de convite |
| `src/app/auth/confirm/route.ts` | Verifica token do convite e cria sessão |
| `src/app/onboarding/admin/page.tsx` | Interface do onboarding (5 steps) |
| `src/app/onboarding/admin/hooks/useOnboardingAdmin.ts` | Lógica do onboarding (validações + submit) |
| `src/lib/supabase/middleware.ts` | Proteção de rotas e redirecionamentos |
| `tests/reenviar_convite.js` | Script para reenviar convite manualmente |
| `tests/testar_onboarding.js` | Script para simular onboarding completo via Node.js |

---

## Banco de Dados — Trigger Crítico

```sql
-- Criado em 2026-02-19
-- Garante que todo novo usuário em auth.users tenha um profile em public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, roles, campanha_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
    ARRAY['admin'],
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

> **Importante:** Sem esse trigger, o `INSERT` em `campanha_membro` falha com FK violation porque `profile_id` não existe em `profiles`.

---

## Observações para Desenvolvimento Futuro

1. **RLS desabilitado:** Todas as policies RLS do schema `public` estão desabilitadas durante o desenvolvimento. **Reativar e auditar na Fase 6** antes de ir para produção com múltiplos clientes.

2. **`profiles.nome_completo`** fica com o email como valor inicial (fallback do trigger). O onboarding não atualiza esse campo ainda — considerar adicionar um campo de nome no Step 1 ou Step 2.

3. **`profiles.campanha_id` é nullable** por design: o trigger cria o profile sem campanha, e o onboarding preenche depois. Isso é intencional.

4. **Reenvio manual de convite:** Use `node tests/reenviar_convite.js <email> <plano_slug>` para reenviar convites sem precisar refazer o pagamento.

5. **Simulação completa do onboarding:** Use `node tests/testar_onboarding.js <email>` para testar todo o fluxo sem interface.

6. **Rate limit do Supabase:** O `inviteUserByEmail` tem rate limit. Se o mesmo email for convidado mais de uma vez em curto período, retorna erro 429. O webhook trata esse caso logando o erro sem bloquear o fluxo.

---

**Projeto Supabase:** `xkqtrwbnionpbjziilgy`  
**URL de produção:** `https://app.idealiscore.com.br`  
**Stack:** Next.js 15, React 19, TypeScript, Supabase, shadcn/ui, Tailwind CSS 3.4
