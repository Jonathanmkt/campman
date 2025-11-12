'use client'

import dynamic from 'next/dynamic'
import { Toaster } from './sonner'

// Importação dinâmica do Toast, com renderização apenas no cliente
const Toast = dynamic(
  () => import('./toast').then((mod) => mod.Toast),
  { ssr: false }
)

export function ToastProvider() {
  return (
    <>
      <Toast />
      <Toaster />
    </>
  )
}
