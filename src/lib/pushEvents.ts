import { supabase } from './supabase';
import { getDatabase } from './database/db';

/**
 * Função PUSH: Envia dados locais pendentes para o Supabase.
 * Deve ser chamada periodicamente ou quando a rede voltar.
 */
export const pushEventsToSupabase = async () => {
  const db = await getDatabase();
  if (!db) return;

  // 1. Busca eventos onde synced_at é NULL (ou seja, pendentes)
  // Usamos exec() para executar a query
  const unsyncedEvents = await db.events.find({
    selector: {
      synced_at: { $eq: null }
    }
  }).exec();

  if (unsyncedEvents.length === 0) {
    console.log('✅ Nada para sincronizar (Push).');
    return;
  }

  console.log(`📡 Sincronizando ${unsyncedEvents.length} eventos para a nuvem...`);

  // 2. Prepara os dados para o Supabase
  // Convertemos o documento RxDB para JSON puro
  const payload = unsyncedEvents.map(doc => {
    const data = doc.toJSON();
    // Removemos campos internos do RxDB (_rev, _meta, etc) se existirem
    // O Supabase só quer os dados definidos no schema
    return {
      client_event_id: data.client_event_id,
      silo_id: data.silo_id,
      user_id: data.user_id,
      event_type: data.event_type,
      amount_kg: data.amount_kg,
      input_method: data.input_method,
      created_at: data.created_at,
      updated_at: data.updated_at
      // NÃO enviamos synced_at para o Supabase, lá ele gerencia o próprio estado se precisar
    };
  });

  try {
    // 3. Envia para o Supabase (Upsert garante idempotência pelo ID)
    const { error } = await supabase
      .from('events')
      .upsert(payload, { onConflict: 'client_event_id' });

    if (error) throw error;

    // 4. Sucesso! Marca localmente como sincronizado
    const now = new Date().toISOString();
    
    // Atualização em massa atômica (Atomic Update)
    await db.events.bulkUpsert(
        unsyncedEvents.map(doc => {
            const data = doc.toJSON();
            data.synced_at = now; // Marca a data do sync
            return data;
        })
    );

    console.log('✅ Sincronização concluída com sucesso.');

  } catch (err) {
    console.error('❌ Erro ao sincronizar com Supabase:', err);
    // Não fazemos nada com os dados locais; eles tentarão novamente na próxima vez.
  }
};
