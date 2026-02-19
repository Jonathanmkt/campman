/**
 * Monitor de pedido em tempo real
 * 
 * 1. Faz um checkout de cartão de crédito
 * 2. Monitora o status do pedido a cada 1s por até 60s
 * 3. Reporta quando mudar para paid/failed ou timeout
 * 
 * Executar: node tests/monitor_pedido.js
 * Requer: servidor Next.js rodando em localhost:3000
 */

require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function fazerCheckout() {
  console.log('\n📦 Criando pedido de teste (cartão de crédito)...');

  const response = await fetch(`${BASE_URL}/api/pagarme/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: 'Monitor Test',
        email: 'monitor@teste.com',
        document: '93095135270',
      },
      items: [{ amount: 9900, description: 'Plano Básico', quantity: 1, code: 'basico' }],
      payment_method: 'credit_card',
      card: {
        number: '4000000000000010',
        holder_name: 'Monitor Test',
        exp_month: 12,
        exp_year: 30,
        cvv: '123',
      },
    }),
  });

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Checkout falhou:', data.error);
    process.exit(1);
  }

  console.log(`✅ Pedido criado: ${data.data.codigoPedido}`);
  console.log(`   Pagar.me Order ID: ${data.data.pagarmeOrderId}`);
  console.log(`   Status Pagar.me: ${data.data.status}`);
  return data.data.codigoPedido;
}

async function consultarPedido(codigo) {
  const response = await fetch(`${BASE_URL}/api/pedidos/${codigo}`);
  const data = await response.json();
  if (!data.success) return null;
  return data.data;
}

async function monitorar(codigo) {
  const MAX_SEGUNDOS = 5;
  let segundos = 0;

  console.log(`\n⏱️  Monitorando pedido ${codigo} (máx ${MAX_SEGUNDOS}s)...\n`);

  return new Promise((resolve) => {
    const intervalo = setInterval(async () => {
      segundos++;
      const pedido = await consultarPedido(codigo);

      if (!pedido) {
        console.log(`[${segundos}s] ⚠️  Pedido não encontrado na API local`);
        return;
      }

      const statusIcon = {
        pending: '🟡',
        processing: '🔵',
        paid: '🟢',
        failed: '🔴',
        expired: '⚫',
      }[pedido.status] || '❓';

      console.log(`[${segundos}s] ${statusIcon} status=${pedido.status} | webhook=${pedido.webhook_recebido_em ? '✅ recebido' : '⏳ aguardando'} | convite=${pedido.convite_enviado_em ? '✅ enviado' : '⏳ pendente'}`);

      if (pedido.status === 'paid') {
        clearInterval(intervalo);
        console.log('\n🎉 SUCESSO! Pedido confirmado como PAGO.');
        console.log(`   Webhook recebido em: ${pedido.webhook_recebido_em}`);
        console.log(`   Convite enviado em:  ${pedido.convite_enviado_em || '(ainda não)'}`);
        resolve('paid');
      } else if (pedido.status === 'failed') {
        clearInterval(intervalo);
        console.log('\n❌ Pedido marcado como FALHOU.');
        resolve('failed');
      } else if (segundos >= MAX_SEGUNDOS) {
        clearInterval(intervalo);
        console.log('\n⏰ TIMEOUT: Pedido não mudou de status em 5 segundos.');
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('   1. O webhook da Pagar.me está configurado para apontar para sua URL pública?');
        console.log('   2. Em ambiente local, a Pagar.me NÃO consegue chamar localhost.');
        console.log('      → Use ngrok ou similar: ngrok http 3000');
        console.log('      → Configure a URL do webhook no dashboard Pagar.me:');
        console.log('        https://sua-url-ngrok.ngrok.io/api/webhooks/pagarme');
        console.log('   3. Verifique as variáveis PAGARME_WEBHOOK_USER e PAGARME_WEBHOOK_PASSWORD no .env');
        console.log('\n💡 Para simular o webhook manualmente, rode:');
        console.log(`   node tests/simular_webhook.js ${codigo}`);
        resolve('timeout');
      }
    }, 1000);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('MONITOR DE PEDIDO - Idealis Core');
  console.log('='.repeat(60));

  try {
    const codigo = await fazerCheckout();
    const resultado = await monitorar(codigo);

    console.log('\n' + '='.repeat(60));
    console.log(`RESULTADO FINAL: ${resultado.toUpperCase()}`);
    console.log('='.repeat(60));
  } catch (err) {
    console.error('\n❌ Erro inesperado:', err.message);
    process.exit(1);
  }
}

main();
