# Integração Pagar.me - Idealis Core

## 📋 Visão Geral

Integração completa com Pagar.me v5 para processar pagamentos de planos e disparar convites automáticos de admin via Supabase.

## 🔑 Credenciais Necessárias (.env.local)

```env
# Pagar.me API Keys
PAGARME_SECRET_KEY=sk_test_...        # Secret key (ambiente de testes)
PAGARME_PUBLIC_KEY=pk_test_...        # Public key (não usado no backend)

# Webhook Authentication (Basic Auth)
PAGARME_WEBHOOK_USER=idealiscore_webhook_user
PAGARME_WEBHOOK_PASSWORD=sua_senha_segura_aqui

# URL do site (para redirects)
NEXT_PUBLIC_SITE_URL=https://app.idealiscore.com
```

**⚠️ IMPORTANTE:** 
- Use credenciais `sk_test_` e `pk_test_` em desenvolvimento
- Use credenciais `sk_live_` e `pk_live_` em produção
- Nunca commite o arquivo `.env.local` (já está no `.gitignore`)

## 🏗️ Arquitetura

### Endpoints Criados

1. **POST /api/pagarme/checkout** - Cria sessão de checkout
   - Recebe: `{ customer, items }`
   - Retorna: `{ checkoutUrl, orderId, expiresAt }`
   - Redireciona usuário para página de pagamento da Pagar.me

2. **POST /api/webhooks/pagarme** - Recebe notificações da Pagar.me
   - Autenticação: Basic Auth (usuário/senha)
   - Eventos tratados: `order.paid`, `order.payment_failed`, `order.canceled`, `charge.*`
   - Dispara convite Supabase automaticamente quando `order.paid`

3. **GET /api/pagarme/orders?orderId=xxx** - Consulta status de pedido
   - Usado pela página de sucesso para exibir detalhes

### Páginas Criadas

1. **/checkout** - Formulário de pagamento
   - Seleção de plano (Básico/Profissional)
   - Dados do cliente (nome, email, CPF)
   - Redireciona para Pagar.me após criar checkout

2. **/payment/success** - Confirmação de pagamento
   - Exibe detalhes do pedido
   - Informa que convite foi enviado por email
   - Links para dashboard

## 🔄 Fluxo Completo

```
1. Cliente acessa /checkout
   ↓
2. Preenche formulário (plano, nome, email, CPF)
   ↓
3. POST /api/pagarme/checkout cria pedido
   ↓
4. Cliente é redirecionado para página Pagar.me
   ↓
5. Cliente paga (cartão/PIX/boleto)
   ↓
6. Pagar.me envia webhook POST /api/webhooks/pagarme
   ↓
7. Webhook valida Basic Auth
   ↓
8. Evento order.paid → inviteAdmin() → Supabase inviteUserByEmail
   ↓
9. Cliente recebe email com link de convite
   ↓
10. Cliente clica no link → /auth/oauth → /onboarding/admin
   ↓
11. Onboarding: define senha + cria campanha + assinatura
   ↓
12. Redireciona para /dashboard
```

## 🔐 Autenticação do Webhook

**IMPORTANTE:** Pagar.me usa **APENAS Basic Authentication** (usuário/senha).  
**NÃO** usa HMAC/signatures como outros gateways.

### Configuração no Painel Pagar.me

1. Acesse: **Configurações → Webhooks**
2. Adicione nova URL: `https://app.idealiscore.com/api/webhooks/pagarme`
3. Selecione eventos:
   - `order.paid` ✅ (essencial)
   - `order.payment_failed` ✅ (recomendado)
   - `order.canceled` ✅ (recomendado)
4. Configure autenticação:
   - Tipo: **Basic Auth**
   - Usuário: valor de `PAGARME_WEBHOOK_USER`
   - Senha: valor de `PAGARME_WEBHOOK_PASSWORD`

## 🧪 Testes

### Ambiente Local com ngrok

```bash
# Terminal 1: Iniciar Next.js
npm run dev

# Terminal 2: Expor localhost com ngrok
ngrok http 3000
```

Copie a URL do ngrok (ex: `https://abc123.ngrok.io`) e configure no painel Pagar.me:
- URL Webhook: `https://abc123.ngrok.io/api/webhooks/pagarme`

### Cartões de Teste

**Aprovado:**
- Número: `5555 4444 3333 1111`
- CVV: `123`
- Validade: qualquer futura

**Recusado:**
- Número: `4000 0000 0000 0002`
- CVV: `123`
- Validade: qualquer futura

### Fluxo de Teste Completo

1. Acesse: `http://localhost:3000/checkout`
2. Selecione plano e preencha dados
3. Clique em "Ir para Pagamento"
4. Use cartão de teste aprovado
5. Verifique logs do terminal (webhook recebido)
6. Verifique email (convite Supabase enviado)
7. Clique no link do email
8. Complete onboarding
9. Acesse dashboard

## 📊 Planos Disponíveis

```typescript
const PLANOS = [
  { 
    slug: 'basico', 
    nome: 'Plano Básico', 
    valor: 9900, // R$ 99,00
    descricao: 'Ideal para campanhas pequenas' 
  },
  { 
    slug: 'profissional', 
    nome: 'Plano Profissional', 
    valor: 19900, // R$ 199,00
    descricao: 'Recursos avançados' 
  },
];
```

**Nota:** Valores em centavos (ex: 9900 = R$ 99,00)

## 🔍 Mapeamento Plano → Convite

O webhook extrai o plano do campo `items[0].description` ou `items[0].id`:

```typescript
// Exemplo de item enviado ao criar checkout
{
  "id": "plano_profissional",
  "description": "Plano Profissional Idealis Core",
  "amount": 19900,
  "quantity": 1
}
```

O webhook identifica automaticamente:
- Se contém "profissional" → `plano_slug: 'profissional'`
- Se contém "cortesia" → `plano_slug: 'cortesia'`
- Padrão → `plano_slug: 'basico'`

## 🚨 Troubleshooting

### Webhook não está sendo chamado
- Verifique se a URL está correta no painel Pagar.me
- Confirme que ngrok está rodando (em dev)
- Verifique logs do Pagar.me (painel → Webhooks → Histórico)

### Webhook retorna 401 Unauthorized
- Verifique se `PAGARME_WEBHOOK_USER` e `PAGARME_WEBHOOK_PASSWORD` estão corretos no `.env.local`
- Confirme que as mesmas credenciais estão no painel Pagar.me

### Convite não é enviado
- Verifique logs do terminal: `[Webhook] 💰 Pedido PAGO`
- Confirme que `customer.email` está presente no payload
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurado

### Checkout retorna erro
- Verifique se `PAGARME_SECRET_KEY` está correto
- Confirme que valores estão em centavos
- Valide CPF (11 dígitos sem formatação)

## 📚 Documentação Oficial

- [Pagar.me API v5](https://docs.pagar.me)
- [Exemplo de Webhook](https://docs.pagar.me/reference/exemplo-de-webhook-1)
- [Eventos de Webhook](https://docs.pagar.me/reference/eventos-de-webhook-1)

## ✅ Checklist de Deploy

- [ ] Credenciais de produção configuradas (`sk_live_`, `pk_live_`)
- [ ] URL do webhook atualizada no painel Pagar.me
- [ ] `NEXT_PUBLIC_SITE_URL` aponta para domínio real
- [ ] Webhook testado com pagamento real
- [ ] Logs de produção monitorados
- [ ] Backup de credenciais em local seguro

---

**Última atualização:** 2026-02-17  
**Versão da API Pagar.me:** v5
