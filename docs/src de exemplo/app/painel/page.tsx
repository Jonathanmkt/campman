import { redirect } from 'next/navigation';

export default function PainelPage() {
  // Redirecionamento no servidor para evitar execuções duplicadas do middleware
  redirect('/painel/associados');
}
