'use client';

import React, { useState } from 'react';
import { PlusCircle, Filter, Tractor, Wheat, Layers, Smartphone } from "lucide-react";
import { useRouter } from 'next/navigation';
import { SiloCard } from "@/components/domain/SiloCard";
import { SiloDocType } from '@/lib/database/schema';
import { FieldList } from "@/components/domain/FieldList";
import { NewFieldForm } from "@/components/domain/NewFieldForm";

// Mock moldado no formato RxDB para evitar quebra.
// capacity_kg está sendo passado para testarmos a conversão para Toneladas.
const MOCK_SILOS: (SiloDocType & { dry_matter_percentage?: number })[] = [
  { 
    id: '1', 
    name: 'Silo 01 - Principal', 
    type: 'Trincheira', 
    content_type: 'Milho (Safra 2024)', 
    capacity_kg: 500000, 
    dry_matter_percentage: 32,
    location: 'Setor A',
    created_at: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Silo 02 - Reserva', 
    type: 'Superfície', 
    content_type: 'Sorgo', 
    capacity_kg: 200000, 
    dry_matter_percentage: 35,
    location: 'Setor B',
    created_at: new Date().toISOString()
  }
];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('silos');
  const [isCreatingField, setIsCreatingField] = useState(false);
  const router = useRouter();

  if (isCreatingField) {
    return (
      <NewFieldForm 
        onCancel={() => setIsCreatingField(false)} 
        onSave={(data: any) => { setIsCreatingField(false); }} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative mt-4">
      
      {/* Cabeçalho da Seção Operacional */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Visão Operacional</h1>
          <p className="text-ui-muted mt-1">Gerencie o estoque físico e ativos da propriedade.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <button onClick={() => router.push('/operator')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-brand-900 border border-concrete-100 rounded-lg font-bold hover:bg-slate-50 hover:border-brand-900 transition-colors shadow-sm active:scale-95">
            <Smartphone size={18} />
            Modo Operador
          </button>
          
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-concrete-100 rounded-lg text-ui-text font-medium hover:bg-slate-50 hover:border-brand-900 hover:text-brand-900 transition-all shadow-sm active:scale-95">
            <Filter size={18} />
            Filtros
          </button>
          
          {activeTab === 'silos' && (
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-lg font-bold hover:bg-brand-700 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95">
              <PlusCircle size={18} className="text-earth-400" />
              Novo Silo
            </button>
          )}
        </div>
      </div>

      {/* Navegação de Ativos */}
      <div className="border-b border-concrete-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-8 min-w-max px-1">
          <button 
            onClick={() => setActiveTab('silos')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'silos' ? 'border-brand-900 text-brand-900' : 'border-transparent text-ui-muted hover:text-brand-900'
            }`}
          >
            <Layers size={18} />
            Silos Ativos ({MOCK_SILOS.length})
          </button>
          <button 
             onClick={() => setActiveTab('talhoes')}
             className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'talhoes' ? 'border-brand-900 text-brand-900' : 'border-transparent text-ui-muted hover:text-brand-900'
            }`}
          >
            <Wheat size={18} />
            Talhões
          </button>
          <button 
            onClick={() => setActiveTab('maquinas')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'maquinas' ? 'border-brand-900 text-brand-900' : 'border-transparent text-ui-muted hover:text-brand-900'
            }`}
          >
             <Tractor size={18} />
            Maquinário
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'silos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {MOCK_SILOS.map((silo) => (
            <SiloCard 
              key={silo.id}
              silo={silo}
              onClick={() => router.push(`/silos/${silo.id}`)}
            />
          ))}
        </div>
      ) : activeTab === 'talhoes' ? (
        <FieldList onNewField={() => setIsCreatingField(true)} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
          <div className="p-4 bg-concrete-100 rounded-full mb-4 text-brand-900">
            <Tractor size={32} />
          </div>
          <h3 className="text-lg font-bold text-brand-900">Módulo em desenvolvimento</h3>
          <p className="text-ui-muted text-sm max-w-xs text-center mt-2">
            A gestão de maquinário estará disponível na próxima atualização.
          </p>
        </div>
      )}
    </div>
  );
}
