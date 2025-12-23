import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Confirmar convite e criar senha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, senha } = body;

    // Validações
    if (!token?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar convite antes de criar usuário
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select('id, telefone, status, expires_at')
      .eq('token', token.trim())
      .single();

    if (conviteError || !convite) {
      return NextResponse.json(
        { success: false, error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    if (convite.status !== 'pendente') {
      return NextResponse.json(
        { success: false, error: 'Este convite já foi utilizado ou cancelado' },
        { status: 400 }
      );
    }

    if (new Date(convite.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este convite expirou' },
        { status: 400 }
      );
    }

    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário técnico no Supabase Auth para satisfazer FK de profiles
    const telefoneNumeros = convite.telefone?.replace(/\D/g, '') || '';
    const authEmail = `mobile+${token.trim()}@convites.local`;
    const tempPassword = `${randomUUID()}Aa!`;

    const { data: authUserData, error: authUserError } = await supabase.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        origem: 'convite_mobile',
        telefone: telefoneNumeros,
      },
    });

    if (authUserError || !authUserData?.user?.id) {
      return NextResponse.json(
        { success: false, error: authUserError?.message || 'Falha ao criar usuário interno' },
        { status: 500 }
      );
    }

    // Chamar função do banco para confirmar convite
    const { data, error } = await supabase.rpc('confirmar_convite', {
      p_token: token.trim(),
      p_senha_hash: senhaHash,
      p_auth_user_id: authUserData.user.id,
    });

    if (error) {
      console.error('Erro ao confirmar convite:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Verificar se a função retornou sucesso
    if (!data?.success) {
      return NextResponse.json(
        { success: false, error: data?.error || 'Erro ao confirmar convite' },
        { status: 400 }
      );
    }

    // Retornar dados do usuário criado (sem a senha)
    return NextResponse.json({
      success: true,
      data: {
        profile_id: data.profile_id,
        telefone: data.telefone,
        nome: data.nome,
        role: data.role,
      },
      message: 'Cadastro confirmado com sucesso! Você já pode fazer login.',
    });
  } catch (error) {
    console.error('Erro ao confirmar convite:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Validar token (verificar se é válido antes de mostrar formulário)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar convite pelo token
    const { data: convite, error } = await supabase
      .from('convites')
      .select(`
        id,
        telefone,
        nome_convidado,
        status,
        expires_at,
        lideranca:lideranca_id (
          nome_completo,
          nome_popular
        )
      `)
      .eq('token', token.trim())
      .single();

    if (error || !convite) {
      return NextResponse.json(
        { success: false, error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Verificar status
    if (convite.status !== 'pendente') {
      return NextResponse.json(
        { success: false, error: 'Este convite já foi utilizado ou cancelado' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (new Date(convite.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este convite expirou' },
        { status: 400 }
      );
    }

    // Retornar dados do convite (para pré-preencher formulário)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liderancaData = convite.lideranca as any;
    const nomeCompleto = liderancaData?.nome_completo || convite.nome_convidado;
    return NextResponse.json({
      success: true,
      data: {
        telefone: convite.telefone,
        nome: nomeCompleto,
        expires_at: convite.expires_at,
      },
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
