'use client';

import { useRxData } from '@/lib/database/hooks';
import { useMemo } from 'react';
import { EventDocType } from '@/lib/database/schema';

/**
 * Hook que escuta todos os eventos de um silo e retorna o saldo atual.
 * Regra: Soma de amount_kg de todos os eventos.
 * Append-Only: Não existe campo "saldo" no silo. O saldo é calculado dinamicamente.
 */
export function useSiloBalance(siloId: string) {
  // 1. Busca todos os eventos deste silo específico
  // O RxDB mantém essa query "viva". Se entrar um evento novo, ela atualiza sozinha.
  const { result: events, isFetching } = useRxData<EventDocType>(
    'events',
    collection => collection.find({
      selector: { 
        silo_id: siloId 
      }
    })
  );

  // 2. Calcula a soma (Memoizado para performance)
  const balance = useMemo(() => {
    return events.reduce((acc, event) => {
      return acc + (event.amount_kg || 0);
    }, 0);
  }, [events]);

  return {
    balance,
    eventCount: events.length,
    isLoading: isFetching
  };
}
