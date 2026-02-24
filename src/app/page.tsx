import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redireciona a raiz direto para o dashboard do gerente.
  // Futuramente, aqui colocaremos a lógica que verifica se o usuário é OPERATOR ou MANAGER.
  redirect('/manager');
}
