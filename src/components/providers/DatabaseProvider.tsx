'use client'; 

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDatabase, GestSiloDatabase } from '@/lib/database/db';
import { pushEventsToSupabase } from '@/lib/sync';
import { Provider as RxDBHooksProvider } from '@/lib/database/RxDBHooksProvider'; // Provider compatível

// Contexto para passar o banco para baixo na árvore de componentes
const DatabaseContext = createContext<GestSiloDatabase | null>(null);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<GestSiloDatabase | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const dbPromise = getDatabase();
        if (!dbPromise) {
          console.error('🔥 Banco não disponível (SSR)');
          return;
        }
        const database = await dbPromise;
        setDb(database);
      } catch (err) {
        console.error('🔥 Falha crítica ao iniciar RxDB:', err);
      }
    };
    initDB();
  }, []);

  // Efeito de Sincronização em Background (Heartbeat)
  useEffect(() => {
    if (!db) return;

    // Tenta sincronizar imedamente ao carregar
    pushEventsToSupabase();

    // E depois tenta a cada 2 minutos (120000ms)
    // Isso garante que se a internet voltar, os dados sobem
    const syncInterval = setInterval(() => {
        console.log('⏰ Ciclo de sync automático iniciado...');
        pushEventsToSupabase();
    }, 120000); 

    return () => clearInterval(syncInterval);
  }, [db]);

  if (!db) {
    // Tela de Loading Inicial (Crucial para Apps Offline)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-silo-action">GestSilo</h1>
          <p className="mt-2 text-lg animate-pulse">Carregando Banco Local...</p>
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>
      {/* Envolvemos os filhos com o Provider do rxdb-hooks para habilitar useRxData */}
      <RxDBHooksProvider db={db}>
          {children}
      </RxDBHooksProvider>
    </DatabaseContext.Provider>
  );
};

// Hook personalizado para usar o banco facilmente em qualquer lugar
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase deve ser usado dentro de um DatabaseProvider');
  }
  return context;
};
