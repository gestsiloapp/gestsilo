'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GestSiloDatabase } from '@/lib/database/db';

type RealtimePayload<T = Record<string, unknown>> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
};

/**
 * Sincroniza mudanças do Supabase Realtime para o RxDB local.
 * Quando outro dispositivo ou usuário altera events/silos no Supabase,
 * essas mudanças são refletidas no banco local para manter consistência.
 */
export function useRealtimeSync(db: GestSiloDatabase | null) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    if (!db || typeof window === 'undefined') return;

    const supabase = createClient();

    const channel = supabase
      .channel('gestsilo-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        async (payload: RealtimePayload<Record<string, unknown>>) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const row = payload.new;
              if (!row?.client_event_id) return;

              const eventDoc = {
                client_event_id: String(row.client_event_id),
                silo_id: String(row.silo_id ?? ''),
                user_id: row.user_id ? String(row.user_id) : undefined,
                event_type: String(row.event_type ?? 'USAGE') as 'LOADING' | 'USAGE' | 'COMPENSATION',
                amount_kg: Number(row.amount_kg ?? 0),
                input_method: (row.input_method as 'MANUAL_KG' | 'BUCKET_COUNT' | 'WAGON_COUNT') ?? 'MANUAL_KG',
                created_at: String(row.created_at ?? new Date().toISOString()),
                updated_at: String(row.updated_at ?? new Date().toISOString()),
                sync_status: 'SYNCED' as const,
              };

              await db.events.upsert(eventDoc);
              console.log('📡 Realtime: evento sincronizado no RxDB', eventDoc.client_event_id);
            } else if (payload.eventType === 'DELETE' && payload.old?.client_event_id) {
              const doc = await db.events.findOne({
                selector: { client_event_id: { $eq: String(payload.old.client_event_id) } },
              }).exec();
              if (doc) {
                await doc.remove();
                console.log('📡 Realtime: evento removido do RxDB', payload.old.client_event_id);
              }
            }
          } catch (err) {
            console.error('❌ Realtime events:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'silos',
        },
        async (payload: RealtimePayload<Record<string, unknown>>) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const row = payload.new;
              if (!row?.id) return;

              const siloDoc = {
                id: String(row.id),
                name: String(row.name ?? 'Silo'),
                type: String(row.type ?? ''),
                content_type: row.content_type ? String(row.content_type) : undefined,
                capacity_kg: row.capacity_kg != null ? Number(row.capacity_kg) : undefined,
                location: row.location ? String(row.location) : undefined,
                created_at: row.created_at ? String(row.created_at) : new Date().toISOString(),
              };

              await db.silos.upsert(siloDoc);
              console.log('📡 Realtime: silo sincronizado no RxDB', siloDoc.id);
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              const doc = await db.silos.findOne({
                selector: { id: { $eq: String(payload.old.id) } },
              }).exec();
              if (doc) {
                await doc.remove();
                console.log('📡 Realtime: silo removido do RxDB', payload.old.id);
              }
            }
          } catch (err) {
            console.error('❌ Realtime silos:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Realtime: inscrito em events e silos');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('📡 Realtime: erro na conexão (pode ser offline)');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      console.log('📡 Realtime: canal encerrado');
    };
  }, [db]);
}
