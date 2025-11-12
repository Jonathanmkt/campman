'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function RefreshButton() {
  const refreshPage = () => {
    window.location.reload()
  }

  return (
    <Button 
      onClick={refreshPage} 
      variant="default" 
      className="h-12 px-6 text-base flex-1 sm:flex-initial flex items-center justify-center gap-2 font-medium bg-primary hover:bg-primary-600 transition-colors"
    >
      <RefreshCw className="h-5 w-5" />
      Tentar Novamente
    </Button>
  )
}
