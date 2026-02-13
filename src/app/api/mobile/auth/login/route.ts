import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
import { createClient as createServerClient } from '@/lib/supabase/server';

// POST - Login mobile (telefone + senha)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, senha } = body;

    // Validações
    if (!telefone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    if (!senha) {
      return NextResponse.json(
        { success: false, error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    // Normalizar telefone
    const telefoneNormalizado = telefone.replace(/\D/g, '');

    const supabase = createAdminClient()
    // Buscar usuário por telefone
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, nome_completo, telefone, roles, senha_hash, auth_method, status')
      .eq('telefone', telefoneNormalizado)
      .eq('auth_method', 'mobile')
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar status
    if (profile.status !== 'ativo') {
      return NextResponse.json(
        { success: false, error: 'Usuário inativo. Entre em contato com o coordenador.' },
        { status: 401 }
      );
    }

    // Verificar senha
    if (!profile.senha_hash) {
      return NextResponse.json(
        { success: false, error: 'Usuário sem senha configurada. Use o link de convite.' },
        { status: 401 }
      );
    }

    const senhaValida = await bcrypt.compare(senha, profile.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { success: false, error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Buscar o auth user ID vinculado a este profile
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
    
    if (authError || !authUser) {
      console.error('[LOGIN] Erro ao buscar auth user:', authError);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar sessão. Entre em contato com o suporte.' },
        { status: 500 }
      );
    }

    console.log('[LOGIN] Auth user encontrado:', authUser.user.email);

    // Gerar link de recuperação que contém tokens válidos
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: authUser.user.email!,
    });

    if (linkError || !linkData) {
      console.error('[LOGIN] Erro ao gerar link:', linkError);
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar sessão.' },
        { status: 500 }
      );
    }

    console.log('[LOGIN] Link gerado com sucesso');

    // O hashed_token é o que precisamos para verificar
    const hashedToken = linkData.properties.hashed_token;

    if (!hashedToken) {
      console.error('[LOGIN] Hashed token não encontrado');
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar token de autenticação.' },
        { status: 500 }
      );
    }

    console.log('[LOGIN] Hashed token extraído');

    // Criar cliente server para configurar cookies
    const supabaseServer = await createServerClient();
    
    // Verificar o token de recovery para obter a sessão
    const { data: sessionData, error: sessionError } = await supabaseServer.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'recovery',
    });

    if (sessionError || !sessionData.session) {
      console.error('[LOGIN] Erro ao verificar token:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Erro ao configurar sessão.' },
        { status: 500 }
      );
    }

    console.log('[LOGIN] Sessão configurada com sucesso');

    // Atualizar último acesso
    await supabase
      .from('profiles')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', profile.id);

    // Determinar role principal para redirecionamento
    const roles = profile.roles || [];
    let rolePrincipal = 'lideranca';
    if (roles.includes('coordenador')) {
      rolePrincipal = 'coordenador';
    } else if (roles.includes('colaborador')) {
      rolePrincipal = 'colaborador';
    }

    // Retornar dados do usuário (sessão já foi criada)
    return NextResponse.json({
      success: true,
      data: {
        profile_id: profile.id,
        nome: profile.nome_completo,
        telefone: profile.telefone,
        roles: profile.roles,
        role_principal: rolePrincipal,
      },
      message: 'Login realizado com sucesso!',
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
