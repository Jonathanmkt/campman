/**
 * Testa a API local /api/pagarme/checkout
 * Simula o que o frontend faz ao enviar dados para o backend.
 * 
 * Executar: node tests/pagarme_checkout_api_test.js
 * Requer: servidor Next.js rodando em localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

async function testLocalAPI(payload, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TESTE LOCAL: ${label}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/pagarme/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`HTTP Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`Order ID: ${data.data.orderId}`);
      console.log(`Order Status: ${data.data.status}`);
      console.log(`Charge ID: ${data.data.chargeId}`);
      
      if (data.data.pixQrCode) {
        console.log(`PIX QR Code: ${data.data.pixQrCode.substring(0, 60)}...`);
        console.log(`PIX QR Code URL: ${data.data.pixQrCodeUrl}`);
      }
      if (data.data.boletoUrl) {
        console.log(`Boleto URL: ${data.data.boletoUrl}`);
      }
    } else {
      console.log(`ERRO: ${data.error}`);
      if (data.data) console.log(`Detalhes:`, JSON.stringify(data.data, null, 2));
    }

    return data;
  } catch (err) {
    console.error(`ERRO DE REDE: ${err.message}`);
    return null;
  }
}

// TESTE 1: Cartão de crédito (aprovado)
async function testCreditCard() {
  return testLocalAPI({
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      document: '93095135270',
    },
    items: [{ amount: 9900, description: 'Plano Básico', quantity: 1, code: 'basico' }],
    payment_method: 'credit_card',
    card: {
      number: '4000000000000010',
      holder_name: 'Tony Stark',
      exp_month: 12,
      exp_year: 30,
      cvv: '123',
    },
  }, 'CARTÃO CRÉDITO (aprovado)');
}

// TESTE 2: PIX
async function testPix() {
  return testLocalAPI({
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      document: '93095135270',
    },
    items: [{ amount: 9900, description: 'Plano Básico', quantity: 1, code: 'basico' }],
    payment_method: 'pix',
  }, 'PIX');
}

// TESTE 3: Boleto
async function testBoleto() {
  return testLocalAPI({
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      document: '93095135270',
    },
    items: [{ amount: 9900, description: 'Plano Básico', quantity: 1, code: 'basico' }],
    payment_method: 'boleto',
  }, 'BOLETO');
}

async function runAll() {
  console.log('Testando API local /api/pagarme/checkout...\n');
  
  await testCreditCard();
  await testPix();
  await testBoleto();

  console.log(`\n${'='.repeat(60)}`);
  console.log('TESTES FINALIZADOS');
  console.log('='.repeat(60));
}

runAll();
