'use client'; 

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDatabase, GestSiloDatabase } from '@/lib/database/db';
import { pushEventsToSupabase } from '@/lib/sync';
import { useRealtimeSync } from '@/lib/realtime/useRealtimeSync';
import { Provider as RxDBHooksProvider } from '@/lib/database/RxDBHooksProvider'; // Provider compatível

// Contexto para passar o banco para baixo na árvore de componentes
const DatabaseContext = createContext<GestSiloDatabase | null>(null);

const INIT_TIMEOUT_MS = 15000; // 15s - evita travamento infinito

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<GestSiloDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Realtime: sincroniza mudanças do Supabase (outros dispositivos/usuários) para o RxDB local
  useRealtimeSync(db);

  const initDB = useCallback(async () => {
    setError(null);
    try {
      const dbPromise = getDatabase();
      if (!dbPromise) {
        setError('Banco não disponível (ambiente servidor)');
        return;
      }
      const database = await Promise.race([
        dbPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar banco')), INIT_TIMEOUT_MS)
        ),
      ]);
      setDb(database);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar banco local';
      console.error('🔥 Falha crítica ao iniciar RxDB:', err);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    initDB();
  }, [initDB, retryKey]);

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
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-brand-500">GestSilo</h1>
          {error ? (
            <>
              <p className="mt-2 text-red-400 text-sm">{error}</p>
              <p className="mt-2 text-gray-400 text-xs">
                Tente recarregar a página ou limpar o cache do navegador (F12 → Application → Clear site data).
              </p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:opacity-90"
              >
                Tentar novamente
              </button>
            </>
          ) : (
            <p className="mt-2 text-lg animate-pulse">Carregando Banco Local...</p>
          )}
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
