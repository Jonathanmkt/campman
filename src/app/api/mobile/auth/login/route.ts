import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Retornar dados do usuário (sem senha)
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
