'use client';

import { useRxData } from '@/lib/database/hooks';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Database } from 'lucide-react';
import { SiloCard } from '@/components/domain/SiloCard';
import { SiloDocType } from '@/lib/database/schema';

export default function ManagerDashboard() {
  // Busca apenas a lista de silos (metadados)
  const { result: silos, isFetching } = useRxData<SiloDocType>(
    'silos',
    collection => collection.find()
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-silo-text">Meus Silos</h1>
            <p className="text-gray-500 mt-1">Visão geral do estoque em tempo real</p>
          </div>
          <Button variant="outline" className="h-10 w-10 p-0 rounded-full">
            <Database className="h-5 w-5" />
          </Button>
        </div>

        {isFetching ? (
           <p className="text-center py-10 text-gray-400">Carregando silos...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {silos.map((silo) => (
              <SiloCard key={silo.id} silo={silo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
