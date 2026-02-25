'use client';

import React from 'react';
import { Database, TrendingDown } from "lucide-react";
import { SiloDocType } from '@/lib/database/schema';
import { useSiloBalance } from '@/hooks/useSiloBalance';

interface SiloCardProps {
  silo: SiloDocType;
  onClick?: () => void;
}

export const SiloCard: React.FC<SiloCardProps> = ({ silo, onClick }) => {
  // Hook que consolida a lógica Append-Only do RxDB
  // Assumindo que useSiloBalance retorna ao menos { balance: number } em KG
  const { balance = 0 } = useSiloBalance(silo.id) as any; 

  // Conversões (Kg para Toneladas para UX)
  const currentStockTon = Math.round(balance / 1000);
  const maxCapacityTon = Math.round((silo.capacity_kg ?? 0) / 1000);
  
  // Zootecnia: Cálculo de porcentagem de preenchimento
  const percentage = maxCapacityTon > 0 ? Math.round((currentStockTon / maxCapacityTon) * 100) : 0;
  const progressColor = percentage < 20 ? "bg-status-danger" : "bg-brand-500";

  // Mock temporário de consumo para a UI (até implementarmos o cálculo real de trato)
  const consumoMedioKg = 1200; 
  const daysRemaining = consumoMedioKg > 0 ? Math.floor(balance / consumoMedioKg) : 0;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-6 border border-concrete-100 shadow-sm hover:shadow-xl hover:border-brand-500 transition-all duration-300 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-900 bg-concrete-100 px-2.5 py-1 rounded-full">
              {silo.type}
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-brand-900 animate-pulse shadow-[0_0_8px_rgba(6,78,59,0.4)]" />
          </div>
          <h3 className="text-xl font-bold text-ui-text group-hover:text-brand-900 transition-colors">
            {silo.name}
          </h3>
          <p className="text-base text-ui-muted">{silo.content_type}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-3xl font-bold text-brand-500">{daysRemaining}</span>
          <span className="text-sm text-ui-muted">dias rest.</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-base mb-1.5">
          <span className="text-ui-muted font-medium">Estoque Físico</span>
          <span className="font-bold text-ui-text">{percentage}%</span>
        </div>
        <div className="w-full bg-concrete-100 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1.5 text-sm text-ui-muted text-right">
          {currentStockTon}t / {maxCapacityTon}t
        </div>
      </div>

      <hr className="border-concrete-100 my-4" />

      <div className="grid grid-cols-2 gap-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-earth-100 rounded-lg text-earth-500">
            <Database size={20} />
          </div>
          <div>
            <p className="text-xs text-ui-muted uppercase font-bold">Matéria Seca</p>
            <p className="text-base font-semibold text-ui-text">{(silo as { dry_matter_percentage?: number }).dry_matter_percentage ?? 0}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-earth-100 rounded-lg text-earth-500">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-xs text-ui-muted uppercase font-bold">Consumo Médio</p>
            <p className="text-base font-semibold text-ui-text">{(consumoMedioKg / 1000).toFixed(1)}t / dia</p>
          </div>
        </div>
      </div>
    </div>
  );
};
