'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface SiloOption {
  id: string;
  name: string;
  type: string;
  stockLevel: number; // 0-100
}

interface SiloSelectorProps {
  silos: SiloOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SiloSelector = ({ silos, selectedId, onSelect }: SiloSelectorProps) => {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 px-4 no-scrollbar flex gap-4 snap-x">
      {silos.map((silo) => {
        const isSelected = selectedId === silo.id;
        
        return (
          <button
            key={silo.id}
            onClick={() => onSelect(silo.id)}
            className={`
              relative flex-shrink-0 w-40 h-32 rounded-2xl p-4 text-left flex flex-col justify-between transition-all duration-200 snap-center border
              ${isSelected 
                ? 'bg-brand-900 ring-2 ring-offset-2 ring-brand-900 shadow-lg scale-105 border-transparent' 
                : 'bg-white border-slate-200 shadow-sm'}
            `}
          >
            {/* Indicador de Seleção */}
            {isSelected && (
              <div className="absolute top-2 right-2 text-status-success bg-white rounded-full">
                <CheckCircle2 size={24} fill="currentColor" className="text-status-success" />
              </div>
            )}

            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand-100' : 'text-ui-muted'}`}>
                {silo.type}
              </span>
              <h3 className={`text-lg font-bold leading-tight mt-1 ${isSelected ? 'text-white' : 'text-ui-text'}`}>
                {silo.name}
              </h3>
            </div>

            {/* Barra de Estoque Visual */}
            <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
               <div 
                 className={`h-full ${isSelected ? 'bg-status-success' : 'bg-brand-500'}`} 
                 style={{ width: `${silo.stockLevel}%` }} 
               />
            </div>
          </button>
        );
      })}
    </div>
  );
};