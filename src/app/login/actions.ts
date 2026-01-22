'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciais inválidas ou erro no sistema.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // 1. Cria o Login (Auth)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) {
    // Se o erro for "Signups disabled", é a config do Passo 1 que falta ajustar
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Erro inesperado: Usuário não criado.' };
  }

  // 2. Cria o Perfil (Tabela profiles) - Determinístico via Código
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: 'MANAGER'
    });

  if (profileError) {
    console.error('Erro Profile:', profileError);
    return { error: 'Conta criada, mas erro no perfil: ' + profileError.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}
