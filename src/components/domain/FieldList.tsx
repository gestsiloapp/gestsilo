'use client';

import React from 'react';
import { MapPin, Maximize, Sprout, MoreVertical, Plus } from "lucide-react";

// Mock temporário para renderizar a UI. Em breve será substituído por dados do RxDB.
const MOCK_FIELDS = [
  { id: '1', name: 'Talhão Alvorada', area: 120, culture: 'Milho', status: 'active', soilType: 'Argiloso' },
  { id: '2', name: 'Talhão Boa Esperança', area: 85, culture: 'Sorgo', status: 'harvest', soilType: 'Misto' },
  { id: '3', name: 'Talhão Córrego Fundo', area: 200, culture: 'Soja', status: 'pousio', soilType: 'Arenoso' },
];

interface FieldListProps {
  onNewField: () => void;
}

export const FieldList: React.FC<FieldListProps> = ({ onNewField }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-500 text-white';
      case 'harvest': return 'bg-earth-500 text-white';
      case 'pousio': return 'bg-concrete-500 text-white';
      default: return 'bg-concrete-100 text-ui-text';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Em Desenvolvimento';
      case 'harvest': return 'Em Colheita';
      case 'pousio': return 'Em Pousio';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-brand-900">Talhões Cadastrados</h2>
        <button 
          onClick={onNewField}
          className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Talhão</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_FIELDS.map((field) => (
          <div key={field.id} className="bg-white rounded-xl border border-concrete-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-ui-text mb-1">{field.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(field.status)}`}>
                  {getStatusLabel(field.status)}
                </span>
              </div>
              <button className="text-ui-muted hover:text-brand-900 transition-colors p-1">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-ui-muted gap-3">
                <div className="flex items-center gap-1.5 w-1/2">
                  <Maximize size={16} className="text-earth-400" />
                  <span>{field.area} ha</span>
                </div>
                <div className="flex items-center gap-1.5 w-1/2">
                  <Sprout size={16} className="text-brand-500" />
                  <span className="font-medium text-ui-text">{field.culture}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-ui-muted gap-3 border-t border-concrete-100 pt-3">
                <div className="flex items-center gap-1.5 w-full">
                  <MapPin size={16} className="text-concrete-500" />
                  <span>Solo: {field.soilType}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
