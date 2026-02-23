'use client';

import React from 'react';
import { Sprout, Tractor, ChevronRight, Map, Plus, Clock } from "lucide-react";

// MOCK: Dados dos Talhões (será substituído por RxDB/Supabase na Fase 4)
const fieldsData = [
  {
    id: 1,
    name: "Talhão da Estrada",
    area: 45,
    status: "active", // Cultura em desenvolvimento
    culture: "Milho Híbrido",
    stage: "V4 - Desenvolvimento Vegetativo",
    lastActivity: "Adubação Cobertura (Ontem)"
  },
  {
    id: 2,
    name: "Talhão do Fundo",
    area: 32,
    status: "harvest", // Em colheita
    culture: "Sorgo Gigante",
    stage: "Ponto de Ensilagem",
    lastActivity: "Colheita em andamento"
  },
  {
    id: 3,
    name: "Área Nova",
    area: 15,
    status: "pousio", // Vazio
    culture: "Terra em Descanso",
    stage: "Aguardando Preparo",
    lastActivity: "Dessecação (10 dias atrás)"
  }
];

interface FieldListProps {
  onNewField: () => void;
}

export const FieldList = ({ onNewField }: FieldListProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Cabeçalho da Seção */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Suas Lavouras</h2>
          <p className="text-xs text-ui-muted">3 talhões • 92 hectares totais</p>
        </div>
        <button
          onClick={onNewField}
          className="flex items-center gap-2 bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-900/20 active:scale-95 transition-all hover:bg-brand-700"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Talhão</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Lista de Cards */}
      <div className="grid grid-cols-1 gap-4">
        {fieldsData.map((field) => {
          // Lógica de Cores baseada no Status (Adaptado para o Design System do App)
          const isHarvest = field.status === 'harvest';
          const isPousio = field.status === 'pousio';
          
          let statusColor = "bg-brand-100 text-brand-900 border-brand-100"; // Active (Green)
          let icon = <Sprout size={16} />;
          let borderLeftColor = "bg-brand-900";
          
          if (isHarvest) {
            statusColor = "bg-earth-100 text-earth-500 border-earth-100"; // Harvest (Gold/Earth)
            icon = <Tractor size={16} />;
            borderLeftColor = "bg-earth-500";
          } else if (isPousio) {
            statusColor = "bg-concrete-100 text-ui-muted border-concrete-100"; // Pousio (Grey)
            icon = <Map size={16} />;
            borderLeftColor = "bg-concrete-500";
          }

          return (
            <div
              key={field.id}
              className="bg-white rounded-2xl p-5 border border-concrete-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
            >
              {/* Barra lateral colorida indicadora */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderLeftColor}`} />

              <div className="flex justify-between items-start mb-3 pl-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${statusColor} flex items-center gap-1.5`}>
                      {icon}
                      {isPousio ? "Pousio" : isHarvest ? "Colhendo" : "Em Safra"}
                    </span>
                    <span className="text-xs font-bold text-ui-muted bg-ui-bg px-2 py-1 rounded-md border border-concrete-100">{field.area} ha</span>
                  </div>
                  <h3 className="text-lg font-bold text-ui-text group-hover:text-brand-900 transition-colors">
                    {field.name}
                  </h3>
                </div>
                
                {/* Botão de Ação Rápida (Seta) */}
                <div className="w-8 h-8 rounded-full bg-ui-bg flex items-center justify-center text-ui-muted group-hover:bg-brand-100 group-hover:text-brand-900 transition-colors">
                    <ChevronRight size={18} />
                </div>
              </div>

              {/* Detalhes da Cultura */}
              <div className="pl-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                    <p className="text-[10px] uppercase text-ui-muted font-bold mb-0.5">Cultura Atual</p>
                    <p className="text-sm font-bold text-ui-text">{field.culture}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase text-ui-muted font-bold mb-0.5">Estágio / Status</p>
                    <p className={`text-sm font-bold truncate ${isHarvest ? 'text-earth-500' : 'text-brand-700'}`}>
                        {field.stage}
                    </p>
                </div>
              </div>

              {/* Rodapé: Última Atividade */}
              <div className="mt-4 pt-3 border-t border-concrete-100 pl-3">
                <p className="text-xs text-ui-muted flex items-center gap-1.5 font-medium">
                    <Clock size={12} className="text-concrete-500"/>
                    Última atv: <span className="text-ui-text">{field.lastActivity}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};