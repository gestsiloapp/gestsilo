'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/components/providers/DatabaseProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Save, Truck, PackageMinus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useRxData } from '@/lib/database/hooks';

// AJUSTE CRÍTICO: No Next.js 14, params NÃO é uma Promise.
interface PageProps {
  params: { id: string };
}

export default function NewOperationPage({ params }: PageProps) {
  const router = useRouter();
  const db = useDatabase();
  
  // Acesso direto ao ID (sem useEffect/Promise)
  const siloId = params.id;

  // Busca os dados do Silo específico
  const { result: silos } = useRxData(
    'silos',
    collection => collection.find({ selector: { id: siloId } })
  );
  const silo = silos[0];

  // Estados do Formulário
  const [eventType, setEventType] = useState<'LOADING' | 'USAGE'>('LOADING');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função de Salvar
  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsSubmitting(true);

    try {
      const finalAmount = eventType === 'USAGE' 
        ? -Math.abs(Number(amount)) 
        : Math.abs(Number(amount));

      await db?.events.insert({
        client_event_id: uuidv4(),
        silo_id: siloId,
        user_id: 'user_local',
        event_type: eventType,
        amount_kg: finalAmount,
        input_method: 'MANUAL_KG',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // CORREÇÃO:
        sync_status: 'PENDING' // Antes era synced_at: null
      });

      alert('Operação registrada com sucesso!');
      router.push(`/silos/${siloId}`); 
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar operação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state enquanto o RxDB busca o silo
  if (!silo) {
    return (
      <div className="p-8 text-center text-gray-500">Carregando dados do Silo...</div>
    );
  }

  return (
    <div className="max-w-lg">
        <Button 
            variant="ghost" 
            onClick={() => router.push(`/silos/${siloId}`)} 
            className="mb-4 pl-0 hover:bg-transparent hover:text-brand-500"
        >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para Silo
        </Button>

        <Card>
            <CardHeader className="bg-gray-900 text-white rounded-t-lg py-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider">{silo.type}</p>
                <CardTitle className="text-white text-xl">{silo.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
                
                {/* Seletor de Tipo */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setEventType('LOADING')}
                        className={`
                            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                            ${eventType === 'LOADING' 
                                ? 'border-green-500 bg-green-50 text-green-700' 
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'}
                        `}
                    >
                        <Truck className="h-8 w-8 mb-2" />
                        <span className="font-bold">Chegada (Carga)</span>
                    </button>

                    <button
                        onClick={() => setEventType('USAGE')}
                        className={`
                            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                            ${eventType === 'USAGE' 
                                ? 'border-status-danger bg-red-50 text-status-danger' 
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'}
                        `}
                    >
                        <PackageMinus className="h-8 w-8 mb-2" />
                        <span className="font-bold">Saída (Uso)</span>
                    </button>
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Quantidade (em KG)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="flex h-16 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-3xl font-bold text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none placeholder:text-gray-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                            KG
                        </span>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-600 text-center">
                    Você vai lançar <span className="font-bold text-gray-900">{amount || 0} kg</span> de {eventType === 'LOADING' ? 'entrada' : 'saída'} no {silo.name}.
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={!amount || isSubmitting}
                    className="w-full h-14 text-lg bg-brand-900 hover:bg-brand-700"
                >
                    <Save className="mr-2 h-5 w-5" />
                    Confirmar Lançamento
                </Button>

            </CardContent>
        </Card>
    </div>
  );
}
