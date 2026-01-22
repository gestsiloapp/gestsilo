import { createClient } from './supabase/client';
import { getDatabase } from './database/db';

export const pushEventsToSupabase = async () => {
  const db = await getDatabase();
  if (!db) return;

  // 1. Busca eventos marcados como 'PENDING'
  // Essa query é segura e muito rápida devido ao índice
  const unsyncedEvents = await db.events.find({
    selector: {
      sync_status: { $eq: 'PENDING' }
    }
  }).exec();

  if (unsyncedEvents.length === 0) {
    // console.log('✅ Nada para sincronizar.'); // Comentei para limpar o console
    return;
  }

  console.log(`📡 Sincronizando ${unsyncedEvents.length} eventos pendentes...`);

  // 2. Prepara Payload
  const payload = unsyncedEvents.map(doc => {
    const data = doc.toJSON();
    return {
      client_event_id: data.client_event_id,
      silo_id: data.silo_id,
      user_id: data.user_id,
      event_type: data.event_type,
      amount_kg: data.amount_kg,
      input_method: data.input_method,
      created_at: data.created_at,
      updated_at: data.updated_at
      // Não enviamos sync_status para o Supabase
    };
  });

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('events')
      .upsert(payload, { onConflict: 'client_event_id' });

    if (error) throw error;

    // 3. Sucesso! Atualiza status local para 'SYNCED'
    await db.events.bulkUpsert(
        unsyncedEvents.map(doc => {
            const data = doc.toJSON();
            data.sync_status = 'SYNCED'; 
            return data;
        })
    );

    console.log('✅ Sincronização concluída com sucesso.');

  } catch (err) {
    console.error('❌ Erro ao sincronizar com Supabase:', err);
  }
};
