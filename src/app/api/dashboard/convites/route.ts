import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inviteMember, type InviteMemberRole } from '@/lib/services/invite-member'

/**
 * POST /api/dashboard/convites
 *
 * Envia convite por email para colaborador ou coordenador.
 * Apenas admin/masteradmin podem usar esta rota.
 *
 * Body: { email, role, nomeConvidado?, telefone? }
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário logado
    const supabaseAuth = await createClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin ou masteradmin
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles, campanha_id')
      .eq('id', user.id)
      .single()

    const roles = profile?.roles ?? []
    const isAdmin = roles.includes('admin') || roles.includes('masteradmin')

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem enviar convites' },
        { status: 403 }
      )
    }

    if (!profile?.campanha_id) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma campanha vinculada ao seu perfil' },
        { status: 400 }
      )
    }

    // Validar body
    const body = await request.json()
    const { email, role, nomeConvidado, telefone } = body as {
      email?: string
      role?: string
      nomeConvidado?: string
      telefone?: string
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    const allowedRoles: InviteMemberRole[] = ['colaborador', 'coordenador']
    if (!role || !allowedRoles.includes(role as InviteMemberRole)) {
      return NextResponse.json(
        { success: false, error: 'Role inválido. Use: colaborador ou coordenador' },
        { status: 400 }
      )
    }

    // Enviar convite via Supabase Auth (SMTP)
    const result = await inviteMember({
      email,
      role: role as InviteMemberRole,
      campanhaId: profile.campanha_id,
      invitedBy: user.id,
      nomeConvidado,
      telefone,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { userId: result.userId, email, role },
    })
  } catch (err) {
    console.error('[POST /api/dashboard/convites] Erro:', err)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
