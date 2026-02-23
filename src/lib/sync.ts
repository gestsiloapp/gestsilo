import { createClient } from './supabase/client';
import { getDatabase } from './database/db';

export const pushEventsToSupabase = async () => {
  const db = await getDatabase();
  if (!db) return;

  const unsyncedEvents = await db.events.find({
    selector: { sync_status: { $eq: 'PENDING' } }
  }).exec();

  if (unsyncedEvents.length === 0) return;

  console.log(`📡 Sincronizando ${unsyncedEvents.length} eventos pendentes...`);

  const supabase = createClient();
  const siloIds = [...new Set(unsyncedEvents.map(d => d.silo_id))];

  const { data: silos } = await supabase
    .from('silos')
    .select('id, farm_id')
    .in('id', siloIds);

  const siloToFarm = new Map<string, string>();
  silos?.forEach(s => { siloToFarm.set(s.id, s.farm_id); });

  const { data: firstFarm } = await supabase.from('farms').select('id').limit(1).single();
  const fallbackFarmId = firstFarm?.id;

  const payload = unsyncedEvents.map(doc => {
    const data = doc.toJSON();
    const farmId = siloToFarm.get(data.silo_id) ?? fallbackFarmId;
    if (!farmId) throw new Error('Nenhuma fazenda encontrada no Supabase. Crie uma fazenda primeiro.');
    return {
      client_event_id: data.client_event_id,
      silo_id: data.silo_id,
      user_id: data.user_id || null,
      farm_id: farmId,
      event_type: data.event_type,
      amount_kg: data.amount_kg,
      input_method: data.input_method,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  });

  try {
    const { error } = await supabase
      .from('events')
      .upsert(payload, { onConflict: 'client_event_id' });

    if (error) throw error;

    await db.events.bulkUpsert(
      unsyncedEvents.map(doc => {
        const data = doc.toJSON();
        return { ...data, sync_status: 'SYNCED' as const };
      })
    );

    console.log('✅ Sincronização concluída com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao sincronizar com Supabase:', err);
  }
};
