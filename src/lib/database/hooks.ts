'use client';

import { useEffect, useState, DependencyList } from 'react';
import { RxCollection, RxDocument } from 'rxdb';
import { useDatabase } from '@/components/providers/DatabaseProvider';
import { useRxDatabase } from './RxDBHooksProvider';

/**
 * Hook customizado para usar coleções RxDB no React
 * Retorna os documentos e atualiza automaticamente quando há mudanças
 */
export function useRxCollection<T>(collection: RxCollection<T> | null) {
  const [docs, setDocs] = useState<RxDocument<T>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!collection) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Busca inicial
    collection.find().exec().then((initialDocs) => {
      setDocs(initialDocs);
      setIsLoading(false);
    });

    // Observa mudanças na coleção (as any evita erro de union type do RxDB no build)
    const subscription = (collection as any).$.subscribe((changeEvent: unknown) => {
      collection.find().exec().then((updatedDocs) => {
        setDocs(updatedDocs);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [collection]);

  return { docs, isLoading };
}

/**
 * Hook para buscar todos os silos
 */
export function useSilos() {
  const db = useDatabase();
  return useRxCollection(db?.silos || null);
}

/**
 * Hook para buscar eventos de um silo específico
 */
export function useSiloEvents(siloId: string | null) {
  const db = useDatabase();
  const [docs, setDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !siloId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Busca inicial
    db.events
      .find({
        selector: {
          silo_id: { $eq: siloId }
        }
      })
      .exec()
      .then((initialDocs) => {
        setDocs(initialDocs);
        setIsLoading(false);
      });

    // Observa mudanças nos eventos deste silo (as any evita erro de union type do RxDB no build)
    const subscription = (db.events as any).$.subscribe(() => {
      db.events
        .find({
          selector: {
            silo_id: { $eq: siloId }
          }
        })
        .exec()
        .then((updatedDocs) => {
          setDocs(updatedDocs);
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [db, siloId]);

  return { docs, isLoading };
}

/**
 * Hook que retorna a coleção RxDB pelo nome (para insert, etc.)
 */
export function useRxCollectionByName(collectionName: 'silos' | 'events' | 'analyses') {
  let db;
  try {
    db = useRxDatabase();
  } catch {
    db = useDatabase();
  }
  return db ? (db[collectionName] as RxCollection<any>) : null;
}

/**
 * Hook compatível com rxdb-hooks useRxData
 * Retorna dados reativos de uma coleção RxDB
 * Usa o Provider do rxdb-hooks para acessar o banco
 */
export function useRxData<T = any>(
  collectionName: 'silos' | 'events' | 'analyses',
  queryFn: (collection: RxCollection<any>) => any,
  deps?: DependencyList
) {
  // Tenta usar o Provider do rxdb-hooks primeiro, fallback para useDatabase
  let db;
  try {
    db = useRxDatabase();
  } catch {
    // Fallback para o contexto antigo se o Provider não estiver disponível
    db = useDatabase();
  }

  const [result, setResult] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsFetching(false);
      return;
    }

    const collection = db[collectionName] as RxCollection<any>;
    if (!collection) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);

    // Executa a query inicial
    const query = queryFn(collection);
    query.exec().then((docs: RxDocument<T>[]) => {
      const jsonDocs = docs.map(doc => doc.toJSON());
      setResult(jsonDocs as T[]);
      setIsFetching(false);
    });

    // Observa mudanças na coleção
    const subscription = (collection as any).$.subscribe(() => {
      const updatedQuery = queryFn(collection);
      updatedQuery.exec().then((docs: RxDocument<T>[]) => {
        const jsonDocs = docs.map(doc => doc.toJSON());
        setResult(jsonDocs as T[]);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [db, collectionName, ...(deps ?? [])]);

  return { result, isFetching };
}
