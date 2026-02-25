'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RxCollection } from 'rxdb';
import { useRxData } from '@/lib/database/hooks';
import { SiloCard } from '@/components/domain/SiloCard';
import { SiloDocType } from '@/lib/database/schema';
import { PlusCircle, Filter, Tractor, Wheat, Layers, Smartphone, Loader2, Database } from "lucide-react";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'silos' | 'talhoes' | 'maquinas'>('silos');
  const router = useRouter();

  // --- LÓGICA DO SEU BANCO DE DADOS REAL (RxDB) ---
  const { result: silos, isFetching } = useRxData<SiloDocType>('silos', (collection: RxCollection<unknown>) =>
    collection.find().sort({ created_at: 'desc' })
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10 mt-6">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Visão Operacional</h1>
          <p className="text-slate-500 mt-1">Gerencie o estoque físico e ativos da propriedade.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <button 
            onClick={() => router.push('/operator')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-brand-900 border border-concrete-100 rounded-lg font-bold hover:border-brand-900 transition-colors shadow-sm"
          >
            <Smartphone size={18} />
            Modo Operador
          </button>
          
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-concrete-100 rounded-lg text-brand-900 font-medium hover:bg-concrete-50 transition-all shadow-sm">
            <Filter size={18} />
            Filtros
          </button>
          
          {activeTab === 'silos' && (
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-lg font-bold hover:bg-brand-800 transition-all shadow-md hover:shadow-lg">
              <PlusCircle size={18} className="text-earth-400" />
              Novo Silo
            </button>
          )}
        </div>
      </div>

      {/* Navegação em Abas (Tabs) */}
      <div className="border-b border-concrete-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-8 min-w-max px-1">
          <button 
            onClick={() => setActiveTab('silos')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'silos' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
            <Layers size={18} />
            Silos Ativos ({silos.length})
          </button>
          <button 
             onClick={() => setActiveTab('talhoes')}
             className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'talhoes' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
            <Wheat size={18} />
            Talhões
          </button>
          <button 
            onClick={() => setActiveTab('maquinas')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
              activeTab === 'maquinas' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
             <Tractor size={18} />
            Maquinário
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico das Abas */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-500">
           <Loader2 size={32} className="animate-spin mb-4" />
           <p className="font-medium">Carregando dados da fazenda...</p>
        </div>
      ) : activeTab === 'silos' ? (
        // Aba Silos
        silos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
                <Database size={32} className="text-concrete-400 mb-4" />
                <h3 className="text-lg font-bold text-brand-900">Nenhum silo encontrado</h3>
                <p className="text-sm text-concrete-500 mt-1">Sincronize ou crie um novo silo para começar.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {silos.map((silo) => (
                <SiloCard
                  key={silo.id}
                  silo={silo}
                  onClick={() => router.push(`/silos/${silo.id}`)}
                />
              ))}
            </div>
        )
      ) : activeTab === 'talhoes' ? (
        // Aba Talhões (Placeholder)
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
          <Wheat size={32} className="text-concrete-400 mb-4" />
          <h3 className="text-lg font-bold text-brand-900">Gestão de Talhões</h3>
          <p className="text-sm text-concrete-500 mt-1">Módulo em desenvolvimento.</p>
        </div>
      ) : (
        // Aba Maquinário (Placeholder do AI Studio)
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
          <Tractor size={32} className="text-concrete-400 mb-4" />
          <h3 className="text-lg font-bold text-brand-900">Gestão de Maquinário</h3>
          <p className="text-sm text-concrete-500 mt-1">Módulo em desenvolvimento.</p>
        </div>
      )}
    </div>
  );
}