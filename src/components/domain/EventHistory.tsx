'use client';

import React from 'react';
import { useRxData } from '@/lib/database/hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, PackageMinus, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { EventDocType } from '@/lib/database/schema';

interface EventHistoryProps {
  siloId: string;
}

export const EventHistory = ({ siloId }: EventHistoryProps) => {
  const { result: events, isFetching } = useRxData<EventDocType>(
    'events',
    collection => collection.find({
      selector: { silo_id: siloId },
      sort: [{ created_at: 'desc' }]
    })
  );

  if (isFetching) return <div className="text-gray-500 text-center py-4">Carregando histórico...</div>;
  if (events.length === 0) return <div className="text-gray-400 text-center py-8">Nenhum evento registrado.</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 text-lg">Histórico Recente</h3>
      
      {events.map((event) => {
        const isEntry = event.event_type === 'LOADING';
        const isCompensation = event.event_type === 'COMPENSATION';
        // ATUALIZAÇÃO: Checamos o status pela string, não mais por data nula
        const isSynced = event.sync_status === 'SYNCED';
        
        return (
          <Card key={event.client_event_id} className="border-l-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                <div className={`
                  p-2 rounded-full 
                  ${isEntry ? 'bg-green-100 text-silo-success' : 
                    isCompensation ? 'bg-blue-100 text-blue-600' : 
                    'bg-red-100 text-silo-danger'}
                `}>
                  {isEntry ? <Truck size={20} /> : 
                   isCompensation ? <RefreshCcw size={20} /> :
                   <PackageMinus size={20} />}
                </div>
                
                <div>
                  <p className="font-bold text-gray-900">
                    {isEntry ? 'Carga (Entrada)' : 
                     isCompensation ? 'Ajuste Manual' : 
                     'Consumo (Saída)'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${isEntry ? 'text-silo-success' : 'text-silo-danger'}`}>
                  {event.amount_kg > 0 ? '+' : ''}{event.amount_kg.toLocaleString()} kg
                </p>
                {/* Visualizador de Status Atualizado */}
                <p className={`text-[10px] font-bold ${isSynced ? 'text-green-600' : 'text-amber-500'}`}>
                  {isSynced ? '✅ Sincronizado' : '⏳ Pendente'}
                </p>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
