import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { eventSchema, eventMigrationStrategies, EventDocType, siloSchema, SiloDocType, fieldSchema, FieldDocType } from './schema';

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
import { v4 as uuidv4 } from 'uuid';

export type GestSiloCollections = {
  events: RxCollection<EventDocType>;
  silos: RxCollection<SiloDocType>;
  fields: RxCollection<FieldDocType>; // Nova coleção de campos
};

export type GestSiloDatabase = RxDatabase<GestSiloCollections>;

let dbPromise: Promise<GestSiloDatabase> | null = null;

const _create = async (): Promise<GestSiloDatabase> => {
  console.log('🚜 GestSilo: Inicializando banco local...');

  const db = await createRxDatabase<GestSiloCollections>({
    name: 'gestsilo_db',
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
  });

  await db.addCollections({
    events: {
      schema: eventSchema,
      migrationStrategies: eventMigrationStrategies,
    },
    silos: { schema: siloSchema },
    fields: { schema: fieldSchema },
  });

  // --- SEED (POPULAÇÃO INICIAL) ---
  // Verifica se existem silos. Se não, cria 2 silos de teste.
  const silosCount = await db.silos.find().exec();
  if (silosCount.length === 0) {
      console.log('🌱 Seed: Criando silos de teste...');
      await db.silos.bulkInsert([
          {
              id: uuidv4(),
              name: 'Silo 01 - Principal',
              type: 'Trincheira',
              content_type: 'Milho (Safra 2024)',
              capacity_kg: 500000,
              location: 'Setor A',
              created_at: new Date().toISOString()
          },
          {
              id: uuidv4(),
              name: 'Silo 02 - Reserva',
              type: 'Superfície',
              content_type: 'Sorgo',
              capacity_kg: 200000,
              location: 'Setor B',
              created_at: new Date().toISOString()
          }
      ]);
  }

  console.log('✅ GestSilo: Banco local pronto e verificado.');
  return db;
};

export const getDatabase = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) dbPromise = _create();
  return dbPromise;
};
