import { getUserProfile } from '@/lib/auth/get-user-profile';
import { redirect } from 'next/navigation';

// Esta página agora roda APENAS no servidor
export default async function RootPage() {
  
  // 1. Descobre quem é o usuário
  const profile = await getUserProfile();

  // 2. Lógica de Redirecionamento (Bifurcação)
  if (profile.role === 'MANAGER') {
    redirect('/manager');
  } else {
    // Qualquer outro papel (Operador Pecuária ou Agrícola) vai para a tela operacional
    redirect('/operator');
  }
}
