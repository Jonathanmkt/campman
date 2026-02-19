/**
 * Script de teste direto contra a API Pagar.me v5
 * Testa: Cartão de Crédito, PIX e Boleto
 * 
 * Credenciais de TESTE hardcoded (serão trocadas em produção)
 */

const SECRET_KEY = 'sk_test_f16e152d10b34ec7b7e656410f0832c8';
const AUTH_TOKEN = Buffer.from(`${SECRET_KEY}:`).toString('base64');
const API_URL = 'https://api.pagar.me/core/v5/orders';

async function createOrder(payload, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TESTE: ${label}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`STATUS: ${response.status} FALHA`);
      console.log('ERRO:', JSON.stringify(data, null, 2));
      return null;
    }

    console.log(`STATUS HTTP: ${response.status}`);
    console.log(`Order ID: ${data.id}`);
    console.log(`Order Status: ${data.status}`);
    
    if (data.charges && data.charges[0]) {
      const charge = data.charges[0];
      console.log(`Charge ID: ${charge.id}`);
      console.log(`Charge Status: ${charge.status}`);
      
      if (charge.last_transaction) {
        const tx = charge.last_transaction;
        console.log(`Transaction ID: ${tx.id}`);
        console.log(`Transaction Status: ${tx.status}`);
        console.log(`Transaction Type: ${tx.transaction_type}`);
        console.log(`Acquirer Name: ${tx.acquirer_name || 'N/A'}`);
        console.log(`Acquirer Message: ${tx.acquirer_message || 'N/A'}`);
        console.log(`Acquirer Return Code: ${tx.acquirer_return_code || 'N/A'}`);
        console.log(`Gateway Response: ${JSON.stringify(tx.gateway_response || {})}`);
        if (tx.status === 'failed' || tx.status === 'not_authorized') {
          console.log(`\nDETALHES DO ERRO:`);
          console.log(JSON.stringify(tx, null, 2));
        }
        
        // PIX: mostrar QR Code
        if (tx.qr_code) {
          console.log(`\nPIX QR Code (copia-e-cola): ${tx.qr_code.substring(0, 80)}...`);
          console.log(`PIX QR Code URL: ${tx.qr_code_url}`);
        }
        
        // Boleto: mostrar URL
        if (tx.url) {
          console.log(`\nBoleto URL: ${tx.url}`);
          console.log(`Boleto Barcode: ${tx.barcode}`);
        }
      }
    }

    console.log(`\nSUCESSO!`);
    return data;
  } catch (err) {
    console.error(`ERRO DE REDE: ${err.message}`);
    return null;
  }
}

// ============================================================
// TESTE 1: CARTÃO DE CRÉDITO (dados abertos via card object)
// Número 4000000000000010 = simulador aprovado
// ============================================================
async function testCreditCard() {
  const payload = {
    items: [
      {
        amount: 9900,
        description: 'Plano Básico - Idealis Core',
        quantity: 1,
        code: 'plano_basico',
      },
    ],
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      type: 'individual',
      document: '93095135270',
      document_type: 'CPF',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '11',
          number: '999999999',
        },
      },
    },
    payments: [
      {
        payment_method: 'credit_card',
        credit_card: {
          installments: 1,
          statement_descriptor: 'IDEALISCORE',
          card: {
            number: '4000000000000010',
            holder_name: 'Tony Stark',
            exp_month: 12,
            exp_year: 30,
            cvv: '123',
            billing_address: {
              line_1: '375, Av Paulista, Bela Vista',
              zip_code: '01311300',
              city: 'São Paulo',
              state: 'SP',
              country: 'BR',
            },
          },
        },
      },
    ],
    metadata: {
      origin: 'test_script',
      target_email: 'tony@avengers.com',
    },
  };

  return createOrder(payload, 'CARTÃO DE CRÉDITO (aprovado - 4000000000000010)');
}

// ============================================================
// TESTE 2: PIX
// Valor qualquer = sucesso (status muda para paid automaticamente)
// ============================================================
async function testPix() {
  const payload = {
    items: [
      {
        amount: 9900,
        description: 'Plano Básico - Idealis Core',
        quantity: 1,
        code: 'plano_basico',
      },
    ],
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      type: 'individual',
      document: '93095135270',
      document_type: 'CPF',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '11',
          number: '999999999',
        },
      },
    },
    payments: [
      {
        payment_method: 'pix',
        pix: {
          expires_in: 3600,
        },
      },
    ],
    metadata: {
      origin: 'test_script',
      target_email: 'tony@avengers.com',
    },
  };

  return createOrder(payload, 'PIX (sucesso automático)');
}

// ============================================================
// TESTE 3: BOLETO
// CEP 20040020 = simulador sucesso
// ============================================================
async function testBoleto() {
  const payload = {
    items: [
      {
        amount: 9900,
        description: 'Plano Básico - Idealis Core',
        quantity: 1,
        code: 'plano_basico',
      },
    ],
    customer: {
      name: 'Tony Stark',
      email: 'tony@avengers.com',
      type: 'individual',
      document: '93095135270',
      document_type: 'CPF',
      address: {
        line_1: '375, Av Rio Branco, Centro',
        zip_code: '20040020',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'BR',
      },
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '21',
          number: '999999999',
        },
      },
    },
    payments: [
      {
        payment_method: 'boleto',
        boleto: {
          instructions: 'Pagar até o vencimento',
          due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          document_number: '123456',
          type: 'DM',
        },
      },
    ],
    metadata: {
      origin: 'test_script',
      target_email: 'tony@avengers.com',
    },
  };

  return createOrder(payload, 'BOLETO (CEP 20040020)');
}

// ============================================================
// EXECUTAR TODOS OS TESTES
// ============================================================
async function runAll() {
  console.log('🚀 Iniciando testes Pagar.me API v5...\n');
  console.log(`Secret Key: ${SECRET_KEY.substring(0, 12)}...`);
  console.log(`API URL: ${API_URL}`);

  await testCreditCard();
  await testPix();
  await testBoleto();

  console.log(`\n${'='.repeat(60)}`);
  console.log('TESTES FINALIZADOS');
  console.log('='.repeat(60));
}

runAll();
