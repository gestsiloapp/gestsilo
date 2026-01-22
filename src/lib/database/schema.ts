import {
  toTypedRxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema
} from 'rxdb';

// --- SCHEMA DE EVENTOS ---
export const eventSchemaLiteral = {
  version: 0,
  primaryKey: 'client_event_id',
  type: 'object',
  properties: {
    client_event_id: { type: 'string', maxLength: 36 },
    silo_id: { type: 'string', maxLength: 36 },
    user_id: { type: 'string', maxLength: 36 },
    event_type: {
      type: 'string',
      enum: ['LOADING', 'USAGE', 'COMPENSATION'],
      maxLength: 20
    },
    amount_kg: { type: 'number', minimum: -100000, maximum: 100000 },
    input_method: {
        type: 'string',
        enum: ['MANUAL_KG', 'BUCKET_COUNT', 'WAGON_COUNT'],
        maxLength: 20
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    
    // MUDANÇA CRÍTICA: Trocamos 'synced_at' (null) por 'sync_status' (string)
    // Isso evita o erro de índice inválido no IndexedDB
    sync_status: {
        type: 'string',
        enum: ['PENDING', 'SYNCED'],
        maxLength: 10
    }
  },
  required: ['client_event_id', 'silo_id', 'event_type', 'amount_kg', 'created_at', 'updated_at', 'sync_status'],
  // Agora podemos indexar com segurança, pois não haverá NULL
  indexes: ['sync_status', 'silo_id'] 
} as const;

const eventSchemaTyped = toTypedRxJsonSchema(eventSchemaLiteral);
export type EventDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof eventSchemaTyped>;
export const eventSchema: RxJsonSchema<EventDocType> = eventSchemaLiteral;

// --- SCHEMA DE SILOS (MANTIDO IGUAL) ---
export const siloSchemaLiteral = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string' },
    type: { type: 'string' },
    content_type: { type: 'string' },
    capacity_kg: { type: 'number' },
    location: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name']
} as const;

const siloSchemaTyped = toTypedRxJsonSchema(siloSchemaLiteral);
export type SiloDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof siloSchemaTyped>;
export const siloSchema: RxJsonSchema<SiloDocType> = siloSchemaLiteral;
