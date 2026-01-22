'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { GestSiloDatabase } from './db';

// Contexto para o Provider do rxdb-hooks compatível
const RxDBHooksContext = createContext<GestSiloDatabase | null>(null);

/**
 * Provider compatível com rxdb-hooks
 * Fornece a instância do banco para os hooks useRxData
 */
export const Provider: React.FC<{ db: GestSiloDatabase; children: ReactNode }> = ({ db, children }) => {
  return (
    <RxDBHooksContext.Provider value={db}>
      {children}
    </RxDBHooksContext.Provider>
  );
};

/**
 * Hook para acessar o banco do contexto do rxdb-hooks
 */
export const useRxDatabase = () => {
  const db = useContext(RxDBHooksContext);
  if (!db) {
    throw new Error('useRxDatabase deve ser usado dentro de um RxDBHooksProvider');
  }
  return db;
};
