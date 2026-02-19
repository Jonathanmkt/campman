/**
 * Reenvia convite para um email específico via Supabase Admin API.
 * Uso: node tests/reenviar_convite.js <email> <plano_slug> <charge_id>
 * Ex:  node tests/reenviar_convite.js networkingjantar@gmail.com basico ch_KG4ogaGPueuan6vr
 */

const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2];
const planoSlug = process.argv[3] || 'basico';
const chargeId = process.argv[4] || null;

if (!email) {
  console.error('❌ Informe o email: node tests/reenviar_convite.js <email>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function reenviar() {
  console.log(`\n📧 Reenviando convite para: ${email}`);
  console.log(`   Plano: ${planoSlug} | Charge: ${chargeId || 'n/a'}`);

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/oauth?next=/onboarding/admin`,
    data: {
      role: 'admin',
      plano_tipo: planoSlug === 'cortesia' ? 'cortesia' : 'pago',
      origem_convite: 'pagarme_webhook',
      invited_by: null,
      pagarme_charge_id: chargeId,
      pagarme_subscription_id: null,
    },
  });

  if (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }

  console.log('✅ Convite enviado com sucesso!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email:   ${data.user.email}`);

  // Atualizar convite_enviado_em no pedido
  const { error: updateError } = await supabase
    .from('pedidos')
    .update({ convite_enviado_em: new Date().toISOString() })
    .eq('email', email)
    .eq('status', 'paid')
    .is('convite_enviado_em', null);

  if (updateError) {
    console.warn('⚠️  Convite enviado mas não foi possível atualizar convite_enviado_em:', updateError.message);
  } else {
    console.log('✅ convite_enviado_em atualizado no pedido.');
  }
}

reenviar().catch(err => {
  console.error('❌ Erro inesperado:', err.message);
  process.exit(1);
});
