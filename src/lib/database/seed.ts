'use client';

import { getDatabase } from './db';
import { SiloDocType } from './schema';

/**
 * Popula o banco local com 2 silos de exemplo para testes
 * Assumindo que os silos já vêm pré-configurados pelo Gerente/Supabase
 */
export const seedSilos = async (): Promise<void> => {
  const db = await getDatabase();
  if (!db) {
    console.error('❌ Banco não inicializado. Não é possível fazer seed.');
    return;
  }

  try {
    // Verifica se já existem silos (evita duplicação)
    const existingSilos = await db.silos.find().exec();
    if (existingSilos.length > 0) {
      console.log(`ℹ️ Já existem ${existingSilos.length} silo(s) no banco. Pulando seed.`);
      return;
    }

    // Dados dos 2 silos de exemplo
    const exampleSilos: Omit<SiloDocType, '_rev' | '_meta' | '_attachments'>[] = [
      {
        id: 'silo-001',
        name: 'Trincheira Principal',
        type: 'Trincheira',
        content_type: 'Milho',
        capacity_kg: 500000,
        location: 'Setor A - Lote 1',
        created_at: new Date().toISOString(),
      },
      {
        id: 'silo-002',
        name: 'Bolsa Secundária',
        type: 'Bolsa',
        content_type: 'Sorgo',
        capacity_kg: 200000,
        location: 'Setor B - Lote 3',
        created_at: new Date().toISOString(),
      },
    ];

    // Insere os silos no banco
    await db.silos.bulkInsert(exampleSilos);

    console.log(`✅ Seed concluído: ${exampleSilos.length} silo(s) inseridos com sucesso.`);
  } catch (error) {
    console.error('🔥 Erro ao fazer seed dos silos:', error);
  }
};
