import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  toTypedRxJsonSchema,
  RxJsonSchema
} from 'rxdb';

export const analysisSchemaLiteral = {
  title: 'silo analysis schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    silo_id: { type: 'string' },
    date: { type: 'string' },
    lab: { type: 'string' },
    dryMatter: { type: 'number' },
    ph: { type: 'number' },
    starch: { type: 'number' },
    protein: { type: 'number' },
    ndt: { type: 'number' },
    fdn: { type: 'number' },
    status: { type: 'string', default: 'current' },
    created_at: { type: 'string' }
  },
  required: ['id', 'silo_id', 'date', 'dryMatter'],
  indexes: ['silo_id']
} as const;

const schemaTyped = toTypedRxJsonSchema(analysisSchemaLiteral);
export type AnalysisDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;
export const analysisSchema: RxJsonSchema<AnalysisDocType> = analysisSchemaLiteral;
