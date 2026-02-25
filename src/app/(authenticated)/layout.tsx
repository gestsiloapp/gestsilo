import React from 'react';
import { DatabaseProvider } from '@/components/providers/DatabaseProvider';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DatabaseProvider>{children}</DatabaseProvider>;
}
