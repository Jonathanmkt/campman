import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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

    const supabase = createAdminClient()
    // Buscar convite antes de criar usuário
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select('id, telefone, status, expires_at, campanha_id, campanha:campanha_id(uf)')
      .eq('token', token.trim())
      .single();

    // UF e campanha_id da campanha para usar nos inserts de área
    const campanhaUf = (convite?.campanha as { uf?: string } | null)?.uf ?? 'DF';
    const conviteCampanhaId = convite?.campanha_id ?? null;

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

    // Buscar liderança criada para vincular a área
    // Normalizar telefone removendo formatação para garantir match
    const telefoneNormalizado = convite.telefone?.replace(/\D/g, '') || '';
    console.log('[CONFIRMAR-CONVITE] Buscando liderança para telefone:', convite.telefone, '(normalizado:', telefoneNormalizado + ')');
    
    // Buscar todas as lideranças e filtrar por telefone normalizado no código
    const { data: todasLiderancas, error: liderancaError } = await supabase
      .from('lideranca')
      .select('id, cidade, bairro, estado, latitude, longitude, logradouro, numero, cep, complemento, endereco_formatado, coordenador_regional_id, telefone');
    
    // Filtrar manualmente por telefone normalizado
    const liderancaData = todasLiderancas?.find(l => {
      const telLideranca = l.telefone?.replace(/\D/g, '') || '';
      return telLideranca === telefoneNormalizado || l.telefone === convite.telefone;
    }) || null;
    
    if (liderancaError) {
      console.error('[CONFIRMAR-CONVITE] Erro ao buscar liderança:', liderancaError);
    } else {
      console.log('[CONFIRMAR-CONVITE] Liderança encontrada:', {
        id: liderancaData?.id,
        cidade: liderancaData?.cidade,
        bairro: liderancaData?.bairro,
        latitude: liderancaData?.latitude,
        longitude: liderancaData?.longitude
      });
    }

    if (liderancaData?.cidade && liderancaData?.bairro) {
      console.log('[CONFIRMAR-CONVITE] Iniciando processo de vinculação à área');
      
      // Buscar município pelo nome da cidade
      console.log('[CONFIRMAR-CONVITE] Buscando município:', liderancaData.cidade);
      const { data: municipioData, error: municipioError } = await supabase
        .from('municipio')
        .select('id')
        .ilike('nome', liderancaData.cidade)
        .eq('ativo', true)
        .single();
      
      if (municipioError) {
        console.error('[CONFIRMAR-CONVITE] Erro ao buscar município:', municipioError);
      } else {
        console.log('[CONFIRMAR-CONVITE] Município encontrado:', municipioData?.id);
      }

      if (municipioData) {
        // Buscar área existente com mesma cidade e bairro (case-insensitive)
        console.log('[CONFIRMAR-CONVITE] Buscando área existente:', {
          municipio_id: municipioData.id,
          cidade: liderancaData.cidade,
          bairro: liderancaData.bairro
        });
        
        const { data: areaDataTemp, error: areaSearchError } = await supabase
          .from('area')
          .select('id')
          .eq('municipio_id', municipioData.id)
          .ilike('cidade', liderancaData.cidade)
          .ilike('bairro', liderancaData.bairro)
          .eq('ativo', true)
          .maybeSingle();
        
        let areaData = areaDataTemp;
        
        if (areaSearchError) {
          console.error('[CONFIRMAR-CONVITE] Erro ao buscar área existente:', areaSearchError);
        } else if (areaData) {
          console.log('[CONFIRMAR-CONVITE] ✅ Área existente encontrada:', areaData.id);
        } else {
          console.log('[CONFIRMAR-CONVITE] ⚠️ Nenhuma área existente encontrada, será criada nova área');
        }

        // Se não existe, criar área com dados da liderança
        if (!areaData && conviteCampanhaId) {
          console.log('[CONFIRMAR-CONVITE] Criando nova área com dados:', {
            municipio_id: municipioData.id,
            nome: liderancaData.bairro,
            cidade: liderancaData.cidade,
            bairro: liderancaData.bairro,
            estado: liderancaData.estado || campanhaUf,
            latitude: liderancaData.latitude,
            longitude: liderancaData.longitude,
            needs_review: true
          });
          
          const { data: novaArea, error: areaError } = await supabase
            .from('area')
            .insert({
              municipio_id: municipioData.id,
              nome: liderancaData.bairro,
              tipo: 'bairro',
              bairro: liderancaData.bairro,
              cidade: liderancaData.cidade,
              estado: liderancaData.estado || campanhaUf,
              latitude: liderancaData.latitude,
              longitude: liderancaData.longitude,
              logradouro: liderancaData.logradouro,
              numero: liderancaData.numero,
              cep: liderancaData.cep,
              complemento: liderancaData.complemento,
              endereco_formatado: liderancaData.endereco_formatado,
              ativo: true,
              needs_review: true,
              campanha_id: conviteCampanhaId as string,
            })
            .select('id')
            .single();

          if (areaError) {
            console.error('[CONFIRMAR-CONVITE] ❌ ERRO ao criar área:', {
              message: areaError.message,
              details: areaError.details,
              hint: areaError.hint,
              code: areaError.code
            });
          } else {
            console.log('[CONFIRMAR-CONVITE] ✅ Nova área criada com sucesso:', novaArea?.id);
            areaData = novaArea;
          }
        }

        // Vincular liderança à área
        if (areaData) {
          console.log('[CONFIRMAR-CONVITE] Vinculando liderança à área:', {
            lideranca_id: liderancaData.id,
            area_id: areaData.id,
            tipo_atuacao: 'moradia'
          });
          
          const { data: vinculoData, error: vinculoError } = await supabase
            .from('lideranca_area')
            .insert({
              lideranca_id: liderancaData.id,
              area_id: areaData.id,
              tipo_atuacao: 'moradia',
              ativo: true,
              campanha_id: conviteCampanhaId as string,
            })
            .select('id')
            .single();

          if (vinculoError) {
            console.error('[CONFIRMAR-CONVITE] ❌ ERRO ao vincular liderança à área:', {
              message: vinculoError.message,
              details: vinculoError.details,
              hint: vinculoError.hint,
              code: vinculoError.code
            });
          } else {
            console.log('[CONFIRMAR-CONVITE] ✅ Liderança vinculada à área com sucesso:', vinculoData?.id);
          }
        } else {
          console.error('[CONFIRMAR-CONVITE] ❌ Não foi possível vincular: área não disponível');
        }
      } else {
        console.error('[CONFIRMAR-CONVITE] ❌ Município não encontrado, impossível criar área');
      }
    } else {
      console.log('[CONFIRMAR-CONVITE] ⚠️ Liderança sem cidade/bairro, pulando vinculação de área');
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

    const supabase = createAdminClient()
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
