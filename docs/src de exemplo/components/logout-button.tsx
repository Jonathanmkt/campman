'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button 
      onClick={logout} 
      variant="outline" 
      className="h-12 px-6 text-base flex-1 sm:flex-initial flex items-center justify-center gap-2 font-medium border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <LogOut className="h-5 w-5" />
      Sair
    </Button>
  )
}
