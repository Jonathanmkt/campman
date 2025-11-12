import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redireciona para login como landing page
  redirect('/auth/login')
}
