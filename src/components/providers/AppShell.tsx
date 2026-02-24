'use client';

import { usePathname } from 'next/navigation';
import { DatabaseProvider } from './DatabaseProvider';
import { MainLayout } from '@/components/layout/MainLayout';

/**
 * Orquestra o layout da aplicação:
 * - /login: landing page isolada (sem sidebar, sem header do app)
 * - demais rotas: DatabaseProvider + MainLayout (sidebar, header)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <DatabaseProvider>
      <MainLayout>{children}</MainLayout>
    </DatabaseProvider>
  );
}
