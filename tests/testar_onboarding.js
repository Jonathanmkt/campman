/**
 * Simula o fluxo completo do onboarding de admin:
 * 1) Cria usuário via invite (admin API)
 * 2) Aguarda trigger criar profile automaticamente
 * 3) Cria campanha
 * 4) Cria campanha_membro
 * 5) Atualiza profile com campanha_id e roles
 * 6) Cria assinatura
 *
 * Uso: node tests/testar_onboarding.js <email>
 */

const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2] || 'teste.onboarding@gmail.com';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testar() {
  console.log('\n🚀 Iniciando simulação de onboarding para:', email);

  // 1) Limpar usuário anterior se existir
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
    console.log('🗑️  Usuário anterior removido:', existing.id);
  }

  // 2) Criar usuário via invite (simula webhook pagar.me)
  console.log('\n📧 Criando usuário via invite...');
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/onboarding/admin`,
    data: {
      role: 'admin',
      plano_tipo: 'pago',
      origem_convite: 'pagarme_webhook',
      invited_by: null,
      pagarme_charge_id: 'ch_test_onboarding_script',
      pagarme_subscription_id: null,
    },
  });

  if (inviteError) {
    console.error('❌ Erro ao criar invite:', inviteError.message);
    process.exit(1);
  }

  const userId = inviteData.user.id;
  console.log('✅ Usuário criado via invite:', userId);

  // 3) Aguardar trigger criar profile (pequeno delay)
  await new Promise(r => setTimeout(r, 1000));

  // 4) Verificar se profile foi criado pelo trigger
  const { data: profile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('id, nome_completo, roles, campanha_id')
    .eq('id', userId)
    .single();

  if (profileCheckError || !profile) {
    console.warn('⚠️  Profile não criado pelo trigger, criando manualmente...');
    const { error: profileCreateError } = await supabase.from('profiles').insert({
      id: userId,
      nome_completo: email,
      roles: ['admin'],
      campanha_id: null,
    });
    if (profileCreateError) {
      console.error('❌ Erro ao criar profile:', profileCreateError.message);
      process.exit(1);
    }
    console.log('✅ Profile criado manualmente.');
  } else {
    console.log('✅ Profile criado pelo trigger:', profile);
  }

  // 5) Criar campanha (simula step 2-3 do onboarding)
  console.log('\n🏛️  Criando campanha...');
  const { data: campanha, error: campanhaError } = await supabase
    .from('campanha')
    .insert({
      nome: 'Campanha Teste Script 2026',
      nome_candidato: 'Candidato Teste',
      cargo_pretendido: 'deputado_estadual',
      partido: 'PSD',
      numero_candidato: '55123',
      uf: 'SP',
      cidade: null,
      status: 'ativa',
    })
    .select('id')
    .single();

  if (campanhaError || !campanha) {
    console.error('❌ Erro ao criar campanha:', campanhaError?.message);
    process.exit(1);
  }
  console.log('✅ Campanha criada:', campanha.id);

  // 6) Criar campanha_membro
  console.log('\n👤 Criando vínculo campanha_membro...');
  const { error: membroError } = await supabase.from('campanha_membro').insert({
    campanha_id: campanha.id,
    profile_id: userId,
    role: 'admin',
    status: 'ativo',
  });

  if (membroError) {
    console.error('❌ Erro ao criar campanha_membro:', membroError.message);
    process.exit(1);
  }
  console.log('✅ campanha_membro criado.');

  // 7) Atualizar profile com campanha_id e roles
  console.log('\n🔄 Atualizando profile...');
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({ campanha_id: campanha.id, roles: ['admin'] })
    .eq('id', userId);

  if (profileUpdateError) {
    console.error('❌ Erro ao atualizar profile:', profileUpdateError.message);
    process.exit(1);
  }
  console.log('✅ Profile atualizado com campanha_id.');

  // 8) Buscar plano e criar assinatura
  console.log('\n💳 Criando assinatura...');
  const { data: plano } = await supabase
    .from('plano')
    .select('id, nome')
    .eq('slug', 'basico')
    .single();

  if (plano) {
    const { error: assError } = await supabase.from('assinatura').insert({
      campanha_id: campanha.id,
      plano_id: plano.id,
      status: 'ativa',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      ciclo: 'mensal',
      valor_atual: null,
      motivo_cortesia: null,
    });

    if (assError) {
      console.warn('⚠️  Erro ao criar assinatura (não-bloqueante):', assError.message);
    } else {
      console.log('✅ Assinatura criada para plano:', plano.nome);
    }
  } else {
    console.warn('⚠️  Plano "basico" não encontrado, assinatura não criada.');
  }

  // 9) Resultado final
  console.log('\n🎉 Onboarding simulado com sucesso!');
  console.log('   User ID:     ', userId);
  console.log('   Campanha ID: ', campanha.id);
  console.log('   Email:       ', email);
}

testar().catch(err => {
  console.error('❌ Erro inesperado:', err.message);
  process.exit(1);
});
