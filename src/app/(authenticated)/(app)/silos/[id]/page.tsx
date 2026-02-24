'use client';

import { useRxData } from '@/lib/database/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';
import { SiloCard } from '@/components/domain/SiloCard';
import { EventHistory } from '@/components/domain/EventHistory';
import { SiloDocType } from '@/lib/database/schema';

interface PageProps {
  params: { id: string };
}

export default function SiloDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const siloId = params.id;

  // Busca dados do silo
  const { result: silos } = useRxData<SiloDocType>(
    'silos',
    collection => collection.find({ selector: { id: siloId } })
  );
  const silo = silos[0];

  if (!silo) return null;

  return (
    <div className="pb-20">
      <div className="max-w-2xl">
        <Button 
            variant="ghost" 
            onClick={() => router.push('/')} 
            className="mb-4 pl-0"
        >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
        </Button>

        {/* Card Principal (Reutilizado, mas agora estático ou interativo) */}
        <div className="mb-8">
            <SiloCard silo={silo} />
        </div>

        {/* Botão Flutuante ou Principal para Nova Operação */}
        <div className="mb-8">
            <Button 
                className="w-full h-14 text-lg shadow-lg"
                onClick={() => router.push(`/silos/${siloId}/new`)}
            >
                <Plus className="mr-2 h-6 w-6" />
                Registrar Operação
            </Button>
        </div>

        {/* Lista de Histórico */}
        <EventHistory siloId={siloId} />
      </div>
    </div>
  );
}
