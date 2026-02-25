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
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Visão Operacional</h1>
          <p className="text-slate-500 mt-1.5 text-base">Gerencie o estoque físico e ativos da propriedade.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <button 
            onClick={() => router.push('/operator')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-brand-900 border border-concrete-100 rounded-xl font-bold text-base hover:border-brand-900 transition-colors shadow-sm"
          >
            <Smartphone size={20} />
            Modo Operador
          </button>
          
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white border border-concrete-100 rounded-xl text-brand-900 font-medium text-base hover:bg-concrete-50 transition-all shadow-sm">
            <Filter size={20} />
            Filtros
          </button>
          
          {activeTab === 'silos' && (
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-brand-900 text-white rounded-xl font-bold text-base hover:bg-brand-800 transition-all shadow-md hover:shadow-lg">
              <PlusCircle size={20} className="text-earth-400" />
              Novo Silo
            </button>
          )}
        </div>
      </div>

      {/* Navegação em Abas (Tabs) */}
      <div className="border-b border-concrete-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-10 min-w-max px-1">
          <button 
            onClick={() => setActiveTab('silos')}
            className={`pb-4 border-b-2 font-semibold text-base flex items-center gap-2.5 transition-all ${
              activeTab === 'silos' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
            <Layers size={20} />
            Silos Ativos ({silos.length})
          </button>
          <button 
             onClick={() => setActiveTab('talhoes')}
             className={`pb-4 border-b-2 font-semibold text-base flex items-center gap-2.5 transition-all ${
              activeTab === 'talhoes' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
            <Wheat size={20} />
            Talhões
          </button>
          <button 
            onClick={() => setActiveTab('maquinas')}
            className={`pb-4 border-b-2 font-semibold text-base flex items-center gap-2.5 transition-all ${
              activeTab === 'maquinas' ? 'border-brand-900 text-brand-900' : 'border-transparent text-slate-400 hover:text-brand-900'
            }`}
          >
             <Tractor size={20} />
            Maquinário
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico das Abas */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-24 text-brand-500">
           <Loader2 size={40} className="animate-spin mb-5" />
           <p className="font-semibold text-lg">Carregando dados da fazenda...</p>
        </div>
      ) : activeTab === 'silos' ? (
        // Aba Silos
        silos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
                <Database size={40} className="text-concrete-400 mb-5" />
                <h3 className="text-xl font-bold text-brand-900">Nenhum silo encontrado</h3>
                <p className="text-base text-concrete-500 mt-2">Sincronize ou crie um novo silo para começar.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-7 animate-fade-in w-full">
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
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
          <Wheat size={40} className="text-concrete-400 mb-5" />
          <h3 className="text-xl font-bold text-brand-900">Gestão de Talhões</h3>
          <p className="text-base text-concrete-500 mt-2">Módulo em desenvolvimento.</p>
        </div>
      ) : (
        // Aba Maquinário (Placeholder do AI Studio)
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-concrete-100 border-dashed animate-fade-in">
          <Tractor size={40} className="text-concrete-400 mb-5" />
          <h3 className="text-xl font-bold text-brand-900">Gestão de Maquinário</h3>
          <p className="text-base text-concrete-500 mt-2">Módulo em desenvolvimento.</p>
        </div>
      )}
    </div>
  );
}