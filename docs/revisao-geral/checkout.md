# Revisão: Checkout (Cartão, PIX, Boleto)

## Contexto
O checkout cria pedidos via `/api/pagarme/checkout`, aguarda confirmação pelo webhook `/api/webhooks/pagarme` e dispara convites via Supabase. Este documento acompanha os testes manuais de cada método de pagamento e registra o que funcionou ou não.

## Pré-requisitos
- Variáveis `.env` válidas: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAGARME_SECRET_KEY`, `PAGARME_WEBHOOK_USER`, `PAGARME_WEBHOOK_PASSWORD`, `NEXT_PUBLIC_SITE_URL`.
- Webhook da Pagar.me apontando para `https://<seu-domínio>/api/webhooks/pagarme` (ou túnel local).
- Tabela `pedidos` e logs acessíveis no Supabase.
- Base limpa (usuarios excluídos em `auth.users`) para evitar conflitos de convites anteriores.

## Passo a passo sugerido
1. **Selecionar plano no `/checkout`**
   - Escolher plano desejado (ex.: Profissional) e método de pagamento.
2. **Preencher dados do comprador**
   - Nome completo.
   - E-mail válido (não cadastrado anteriormente).
   - CPF (aceita dados fictícios). 
3. **Pagamento com Cartão (primeiro ciclo)**
   - Número de teste Pagar.me: `4970 1281 8186 5072`
   - Validade futura (ex.: 12/29).
   - CVV: 123.
   - Submeter e aguardar redirecionamento para `/payment/success?order_id=...`.
4. **Monitorar Supabase**
   - `pedidos.status` deve ir de `pending` → `processing` → `paid` após webhook.
   - Campos `pagarme_order_id`, `pagarme_charge_id`, `convite_enviado_em` devem ser preenchidos.
5. **Verificar convite**
   - Conferir e-mail de convite enviado via Supabase.
   - Validar metadata (`plano_tipo`, `origem_convite`).
6. **Repetir para PIX/Boleto** (após confirmar cartão)
   - PIX: validar exibição de QR Code no frontend e atualização do pedido.
   - Boleto: validar link/linha digitável e status posterior.

## Registro dos testes
| Data | Método | Resultado | Observações |
| --- | --- | --- | --- |
| 2026-02-20 | Cartão | Sucesso | Pedido `ped_1771629898485_RELHFH` → status `paid`, webhook recebido 23:26:19Z, convite enviado 23:26:23Z (`pagarme_order_id=or_E93vJlMf1fKNxjQ0`, `pagarme_charge_id=ch_KJWrgenhOh9xRz7G`). |
| _(preencher)_ | PIX | _(Sucesso/Falha)_ | QR Code exibido? Pedido atualizado? |
| _(preencher)_ | Boleto | _(Sucesso/Falha)_ | URL/linha digitável? Status final? |

> Após cada tentativa, completar a linha correspondente ou me informar para preencher. Isso nos guiará para o próximo fluxo (onboarding, etc.).

### Observações de UI (Cartão)
- Tela de sucesso original mostrava feedback mínimo com botões irrelevantes ("Ir para o Dashboard", "Fazer outro pagamento") e ícones pequenos.

#### Melhorias aplicadas (2026-02-20)
- **`globals.css`**: cores primárias atualizadas para azul Idealis `#0055c7` e amarelo `#ffda42`.
- **`feedback-modal.tsx`**: adicionados dois novos tipos de modal:
  - `processing` — spinner azul Idealis animado, exibido enquanto o webhook ainda não confirmou.
  - `email` — ícone de envelope grande (Lucide `Mail`) com pulso amarelo Idealis, exibido após pagamento confirmado, orientando o usuário a verificar o e-mail.
  - Ambos aceitam `subtitle` para texto de apoio abaixo da mensagem principal.
- **`payment/success/page.tsx`**: refatorado para usar `FeedbackModal` nos estados `processing` e `paid`, com fundo escuro `#0a1628` e spinner amarelo no loading inicial. Botões desnecessários removidos.
- **`checkout/page.tsx`**: painel esquerdo ganhou logo, cores oficiais e card glass; painel direito recebeu fundo translúcido, inputs foram simplificados e cartões de método de pagamento replicam o visual glass.
- **Status atual**: UI do checkout está satisfatória para a versão 1.0, porém ainda aberta para refinamentos futuros (animações adicionais, microinterações, etc.).
- **Pendente**: aguardar feedback visual de Jonathan após novo teste para confirmar se a experiência está satisfatória.
