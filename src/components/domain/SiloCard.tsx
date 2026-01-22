'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useSiloBalance } from '@/hooks/useSiloBalance';
import { SiloDocType } from '@/lib/database/schema';

interface SiloCardProps {
  silo: SiloDocType;
}

export const SiloCard = ({ silo }: SiloCardProps) => {
  const router = useRouter();
  
  // Aqui a mágica acontece: cada card calcula seu próprio saldo
  const { balance, isLoading } = useSiloBalance(silo.id);
  
  // Cálculo de porcentagem para barra de progresso visual
  const percentage = Math.min(Math.max((balance / (silo.capacity_kg || 1)) * 100, 0), 100);
  
  // Definição de cor baseada no nível (Visual Management)
  const getProgressColor = () => {
      if (percentage < 20) return 'bg-red-500'; // Baixo estoque
      if (percentage > 90) return 'bg-green-500'; // Cheio
      return 'bg-silo-action'; // Normal
  };

  return (
    <Card className="border-l-4 border-l-silo-action hover:shadow-md transition-all flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-silo-action">
              {silo.type}
            </span>
            <CardTitle className="mt-1 text-2xl">{silo.name}</CardTitle>
          </div>
          {/* Indicador simples de status */}
          <div className="text-xs font-mono text-gray-400">
            {isLoading ? '...' : `${balance.toLocaleString()} kg`}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-end space-y-4">
        {/* Barra de Progresso Visual */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-100 relative">
             <div 
                className={`h-full ${getProgressColor()} transition-all duration-500`} 
                style={{ width: `${percentage}%` }}
             />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
                <p className="text-xs text-gray-400 uppercase">Conteúdo</p>
                <p className="font-semibold text-gray-900">{silo.content_type}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">Capacidade</p>
                <p className="font-semibold text-gray-900">{silo.capacity_kg?.toLocaleString()} kg</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={() => router.push(`/silos/${silo.id}`)}
            >
              Extrato
            </Button>
            <Button 
              onClick={() => router.push(`/silos/${silo.id}/new`)}
            >
              Operação
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};
