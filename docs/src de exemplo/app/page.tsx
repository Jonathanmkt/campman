'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a nova página de login
    router.replace('/auth/login');
  }, [router]);

  // Retorna null ou um componente de carregamento enquanto redireciona
  return null;
}
