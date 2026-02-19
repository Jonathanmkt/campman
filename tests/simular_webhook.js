/**
 * Simula um webhook order.paid da Pagar.me para um pedido local.
 * Útil para testar o fluxo completo em ambiente local (sem ngrok).
 *
 * Uso: node tests/simular_webhook.js <codigo_pedido>
 * Ex:  node tests/simular_webhook.js ped_1771515052424_SQO82Q
 *
 * Requer: servidor Next.js rodando em localhost:3000
 */

const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_USER = process.env.PAGARME_WEBHOOK_USER;
const WEBHOOK_PASSWORD = process.env.PAGARME_WEBHOOK_PASSWORD;

const codigoPedido = process.argv[2];

if (!codigoPedido) {
  console.error('❌ Informe o código do pedido como argumento.');
  console.error('   Uso: node tests/simular_webhook.js ped_XXXXX');
  process.exit(1);
}

if (!WEBHOOK_USER || !WEBHOOK_PASSWORD) {
  console.error('❌ PAGARME_WEBHOOK_USER e PAGARME_WEBHOOK_PASSWORD não configurados no .env');
  process.exit(1);
}

async function simularWebhook() {
  console.log('\n' + '='.repeat(60));
  console.log('SIMULAÇÃO DE WEBHOOK order.paid');
  console.log('='.repeat(60));
  console.log(`Pedido: ${codigoPedido}`);

  // Primeiro busca o pedido local para pegar o pagarme_order_id
  const pedidoRes = await fetch(`${BASE_URL}/api/pedidos/${codigoPedido}`);
  const pedidoData = await pedidoRes.json();

  if (!pedidoData.success) {
    console.error('❌ Pedido não encontrado:', pedidoData.error);
    process.exit(1);
  }

  const pedido = pedidoData.data;
  console.log(`Email: ${pedido.email}`);
  console.log(`Status atual: ${pedido.status}`);
  console.log(`Pagar.me Order ID: ${pedido.pagarme_order_id || '(não definido)'}`);

  // Monta payload simulando exatamente o que a Pagar.me enviaria
  const webhookPayload = {
    id: `wh_${Date.now()}`,
    type: 'order.paid',
    created_at: new Date().toISOString(),
    data: {
      id: pedido.pagarme_order_id || `or_simulado_${Date.now()}`,
      code: codigoPedido,
      status: 'paid',
      customer: {
        name: pedido.nome,
        email: pedido.email,
        document: '93095135270',
      },
      items: [
        {
          id: pedido.plano_slug || 'basico',
          description: pedido.plano_nome || 'Plano Básico',
          amount: Math.round(pedido.valor * 100),
          quantity: 1,
          code: pedido.plano_slug || 'basico',
        },
      ],
      charges: [
        {
          id: `ch_simulado_${Date.now()}`,
          status: 'paid',
          paid_at: new Date().toISOString(),
          amount: Math.round(pedido.valor * 100),
          paid_amount: Math.round(pedido.valor * 100),
        },
      ],
      metadata: {
        origin: 'public_checkout',
        local_order_id: codigoPedido,
        target_email: pedido.email,
      },
    },
  };

  const authToken = Buffer.from(`${WEBHOOK_USER}:${WEBHOOK_PASSWORD}`).toString('base64');

  console.log('\n📤 Enviando webhook simulado...');

  const response = await fetch(`${BASE_URL}/api/webhooks/pagarme`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authToken}`,
    },
    body: JSON.stringify(webhookPayload),
  });

  const result = await response.json();

  console.log(`\nHTTP Status: ${response.status}`);
  console.log(`Resposta:`, JSON.stringify(result, null, 2));

  if (response.ok) {
    console.log('\n✅ Webhook processado com sucesso!');
    console.log('   Aguarde 2s e verifique o status do pedido...\n');

    await new Promise((r) => setTimeout(r, 2000));

    const verificaRes = await fetch(`${BASE_URL}/api/pedidos/${codigoPedido}`);
    const verificaData = await verificaRes.json();
    const pedidoAtualizado = verificaData.data;

    console.log('📋 Status atualizado:');
    console.log(`   status:             ${pedidoAtualizado.status}`);
    console.log(`   webhook_recebido_em: ${pedidoAtualizado.webhook_recebido_em || '(vazio)'}`);
    console.log(`   convite_enviado_em:  ${pedidoAtualizado.convite_enviado_em || '(vazio)'}`);

    if (pedidoAtualizado.status === 'paid') {
      console.log('\n🎉 FLUXO COMPLETO OK! Pedido marcado como pago.');
    } else {
      console.log('\n⚠️  Status não mudou para paid. Verifique os logs do servidor Next.js.');
    }
  } else {
    console.error('\n❌ Webhook rejeitado. Verifique as credenciais no .env:');
    console.error('   PAGARME_WEBHOOK_USER e PAGARME_WEBHOOK_PASSWORD');
  }
}

simularWebhook().catch((err) => {
  console.error('❌ Erro inesperado:', err.message);
  process.exit(1);
});
