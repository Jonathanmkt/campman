import { createClient } from '@/lib/supabase/server'
import { inviteAdmin } from '@/lib/services/invite-admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/admin/invite
 *
 * Envia convite de admin (cortesia) para um novo usuário.
 * Apenas admins autenticados podem disparar este endpoint.
 *
 * Body: { email: string }
 */

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do requisitante
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.roles?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, data: null, error: 'Apenas admins podem enviar convites' },
        { status: 403 }
      )
    }

    // Validar body
    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Disparar convite cortesia
    const result = await inviteAdmin({
      email: parsed.data.email,
      planoTipo: 'cortesia',
      origemConvite: 'masteradmin',
      invitedBy: user.id,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { userId: result.userId, email: parsed.data.email },
      error: null,
    })
  } catch (error) {
    console.error('[POST /api/admin/invite] Erro:', error)
    return NextResponse.json(
      { success: false, data: null, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
