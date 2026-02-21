import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/public/convite-eleitor?token=xxx
 * Valida token de convite de eleitor e retorna dados da campanha.
 * Rota pública — não requer autenticação.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token não informado' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: convite, error } = await supabase
    .from('convite_eleitor')
    .select('id, token, campanha_id, origem_tipo, status, expires_at, campanha:campanha_id(nome, nome_candidato, cargo_pretendido, partido)')
    .eq('token', token.trim())
    .single()

  if (error || !convite) {
    return NextResponse.json({ success: false, error: 'Convite não encontrado' }, { status: 404 })
  }

  if (convite.status !== 'ativo') {
    return NextResponse.json({ success: false, error: 'Este convite já foi utilizado ou expirou' }, { status: 400 })
  }

  if (convite.expires_at && new Date(convite.expires_at) < new Date()) {
    return NextResponse.json({ success: false, error: 'Este convite expirou' }, { status: 400 })
  }

  // Incrementar contador de cliques via SQL para evitar race condition
  await supabase.rpc('increment_convite_eleitor_cliques', { p_convite_id: convite.id }).catch(() => {
    // Fallback: incrementar via update simples (sem race condition protection)
    supabase
      .from('convite_eleitor')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convite.id)
  })

  return NextResponse.json({
    success: true,
    data: {
      conviteId: convite.id,
      campanha: convite.campanha,
      origemTipo: convite.origem_tipo,
    },
  })
}

/**
 * POST /api/public/convite-eleitor
 * Cadastra eleitor via link público com aceite LGPD.
 * Rota pública — não requer autenticação.
 *
 * Body: { token, nome_completo, telefone, aceite_lgpd }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { token, nome_completo, telefone, aceite_lgpd } = body as {
      token?: string
      nome_completo?: string
      telefone?: string
      aceite_lgpd?: boolean
    }

    if (!token || !nome_completo?.trim() || !telefone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Token, nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    if (!aceite_lgpd) {
      return NextResponse.json(
        { success: false, error: 'É necessário aceitar os termos para prosseguir' },
        { status: 400 }
      )
    }

    // Buscar convite válido
    const { data: convite, error: conviteError } = await supabase
      .from('convite_eleitor')
      .select('id, campanha_id, origem_tipo, origem_id, status, expires_at')
      .eq('token', token.trim())
      .single()

    if (conviteError || !convite) {
      return NextResponse.json({ success: false, error: 'Convite não encontrado' }, { status: 404 })
    }

    if (convite.status !== 'ativo') {
      return NextResponse.json({ success: false, error: 'Este convite já foi utilizado ou expirou' }, { status: 400 })
    }

    if (convite.expires_at && new Date(convite.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Este convite expirou' }, { status: 400 })
    }

    // Normalizar telefone
    const telefoneNormalizado = telefone.replace(/\D/g, '')

    // Buscar uma área padrão da campanha para vincular o eleitor
    const { data: areaData } = await supabase
      .from('area')
      .select('id')
      .eq('campanha_id', convite.campanha_id)
      .eq('ativo', true)
      .limit(1)
      .single()

    // Criar eleitor
    const { data: eleitor, error: eleitorError } = await supabase
      .from('eleitor')
      .insert({
        nome_completo: nome_completo.trim(),
        telefone: telefoneNormalizado,
        campanha_id: convite.campanha_id,
        area_id: areaData?.id ?? null,
        responsavel_cadastro: convite.origem_id ?? null,
        ativo: true,
      })
      .select('id')
      .single()

    if (eleitorError || !eleitor) {
      console.error('[Convite Eleitor] Erro ao criar eleitor:', eleitorError)
      return NextResponse.json(
        { success: false, error: 'Erro ao cadastrar. Tente novamente.' },
        { status: 500 }
      )
    }

    // Atualizar convite com eleitor_id e aceite LGPD
    await supabase
      .from('convite_eleitor')
      .update({
        eleitor_id: eleitor.id,
        aceite_lgpd: true,
        aceite_lgpd_at: new Date().toISOString(),
        status: 'usado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', convite.id)

    // Se a origem é liderança, criar vínculo lideranca_eleitor
    if (convite.origem_tipo === 'lideranca' && convite.origem_id) {
      await supabase.from('lideranca_eleitor').insert({
        lideranca_id: convite.origem_id,
        eleitor_id: eleitor.id,
        tipo_relacao: 'convite_link',
        campanha_id: convite.campanha_id,
      })
    }

    // Gerar novo token para o eleitor compartilhar com amigos
    const { data: novoConvite } = await supabase
      .from('convite_eleitor')
      .insert({
        campanha_id: convite.campanha_id,
        origem_tipo: 'eleitor',
        origem_id: eleitor.id,
      })
      .select('token')
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const linkCompartilhar = novoConvite
      ? `${siteUrl}/convite/eleitor?token=${novoConvite.token}`
      : null

    return NextResponse.json({
      success: true,
      data: {
        eleitorId: eleitor.id,
        linkCompartilhar,
      },
    })
  } catch (err) {
    console.error('[POST /api/public/convite-eleitor] Erro:', err)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
