import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'MANAGER' | 'OPERATOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Busca o perfil completo do usuário logado (Server Side)
 * 
 * @returns Perfil do usuário com role, nome completo, etc.
 * @throws Redireciona para /login se não houver usuário autenticado
 */
export async function getUserProfile(): Promise<UserProfile> {
  const supabase = createClient();
  
  // 1. Pega o usuário da sessão Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. Busca os dados na tabela de perfis (Role/Cargo)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Erro ao buscar perfil:', error);
    // Fallback de segurança: se não achar perfil, assume Operador para não dar acesso admin
    return {
      id: user.id,
      email: user.email || '',
      full_name: 'Usuário',
      role: 'OPERATOR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return profile as UserProfile;
}
