import React from 'react';
import { DatabaseProvider } from '@/components/providers/DatabaseProvider';
import { MainLayout } from '@/components/layout/MainLayout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DatabaseProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </DatabaseProvider>
  );
}
