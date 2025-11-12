// TODO: TEMPORÁRIO - Imports comentados durante desenvolvimento
// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: TEMPORÁRIO - Remover proteção de autenticação durante desenvolvimento
  // Esta proteção deve ser reativada antes do deploy em produção
  // Descomente as linhas abaixo para reativar a proteção:
  
  // const supabase = await createClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/auth/login')
  // }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
