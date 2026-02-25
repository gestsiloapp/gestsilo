'use client';

import React, { useState } from "react";
import {
  Search,
  FileText,
  Tractor,
  Truck,
  Droplets,
  CheckCircle2,
  CloudOff,
  AlertCircle
} from "lucide-react";

// MOCK: Dados agrupados por Data (será substituído por RxDB/Supabase na Fase 4)
const initialHistoryData = [
  {
    date: "Hoje, 24 Jan",
    events: [
      {
        id: 1,
        type: "silage", // Silagem
        operator: "Carlos (Op. Pecuária)",
        time: "08:15",
        description: "Retirada de 3.500kg do Silo Trincheira 01",
        sync: true, // Sincronizado
        icon: <Truck size={18} />
      },
      {
        id: 2,
        type: "field", // Lavoura
        operator: "Eduardo (Gerente)",
        time: "10:30",
        description: "Registro de Chuva (25mm) no Talhão da Estrada",
        sync: false, // Pendente (Offline)
        icon: <Droplets size={18} />
      }
    ]
  },
  {
    date: "Ontem, 23 Jan",
    events: [
      {
        id: 3,
        type: "field",
        operator: "José (Op. Agrícola)",
        time: "16:45",
        description: "Finalizou Plantio no Talhão do Fundo (8h maq)",
        sync: true,
        icon: <Tractor size={18} />
      },
      {
        id: 4,
        type: "stock", // Estoque/Insumo
        operator: "Sistema",
        time: "17:00",
        description: "Alerta: Estoque de Inoculante abaixo do mínimo",
        sync: true,
        icon: <AlertCircle size={18} />,
        isSystem: true // Destaque diferente
      }
    ]
  }
];

const filters = [
    { label: "Todos", value: "all" },
    { label: "Silagem", value: "silage" },
    { label: "Lavoura", value: "field" },
    { label: "Estoque", value: "stock" }
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Lógica de Filtragem no Frontend
  const filteredData = initialHistoryData.map(group => {
      const filteredEvents = group.events.filter(event => {
          const matchesType = activeFilter === "all" || event.type === activeFilter;
          const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                event.operator.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesType && matchesSearch;
      });
      return { ...group, events: filteredEvents };
  }).filter(group => group.events.length > 0);

  return (
    <div className="min-h-screen bg-ui-bg pb-20 animate-fade-in">
      
      {/* 1. Cabeçalho Fixo */}
      <header className="bg-white border-b border-concrete-100 sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-brand-900">Histórico</h1>
          
          <button className="flex items-center gap-2 text-brand-900 bg-brand-100 hover:bg-concrete-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <FileText size={16} />
            Exportar
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-concrete-500" size={18} />
            <input
              type="text"
              placeholder="Buscar operador ou atividade..."
              className="w-full pl-10 pr-4 py-2 bg-concrete-100 border-transparent focus:bg-white focus:border-brand-900 focus:ring-1 focus:ring-brand-900 rounded-xl text-sm outline-none transition-all placeholder:text-concrete-500 text-brand-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as unknown as { value: string }).value ?? '')}
            />
          </div>

          {/* Chips de Filtro (Scroll Horizontal) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                  ${activeFilter === filter.value
                    ? 'bg-brand-900 text-white border-brand-900 shadow-md'
                    : 'bg-white text-ui-muted border-concrete-100 hover:border-concrete-500'}
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Timeline */}
      <main className="p-4">
        {filteredData.length > 0 ? filteredData.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-8 relative">
            
            {/* Linha Conectora Vertical */}
            <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-concrete-100 z-0" />

            {/* Data do Grupo */}
            <h2 className="text-xs font-bold text-concrete-500 uppercase tracking-wider mb-4 pl-12 sticky top-36 bg-ui-bg/95 backdrop-blur-sm py-1 z-10 w-fit rounded-r-lg">
              {group.date}
            </h2>

            <div className="space-y-6">
              {group.events.map((event) => (
                <div key={event.id} className="relative z-10">
                  <div className="flex items-start gap-4">
                    
                    {/* Ícone Indicador (Timeline Node) */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-4 border-ui-bg shadow-sm flex-shrink-0
                      ${event.isSystem ? 'bg-earth-100 text-earth-500' : 'bg-white text-brand-900'}
                    `}>
                      {event.icon}
                    </div>

                    {/* Card do Evento */}
                    <div className="flex-1 bg-white p-4 rounded-xl border border-concrete-100 shadow-sm active:scale-[0.99] transition-transform">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-ui-muted bg-concrete-100 px-1.5 py-0.5 rounded">
                          {event.time}
                        </span>
                        
                        {/* Indicador de Sincronização */}
                        {event.sync ? (
                          <div title="Sincronizado" className="flex items-center gap-1">
                             <CheckCircle2 size={14} className="text-brand-900" />
                          </div>
                        ) : (
                          <div title="Pendente de Sincronização" className="flex items-center gap-1">
                             <CloudOff size={14} className="text-earth-500" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-bold text-ui-text leading-tight mb-1">
                        {event.description}
                      </h3>
                      <p className="text-xs text-ui-muted font-medium">
                        {event.operator}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
            <div className="text-center py-10 text-ui-muted">
                <p>Nenhuma atividade encontrada.</p>
            </div>
        )}

        {filteredData.length > 0 && (
            <div className="text-center pt-8 pb-4">
            <button className="text-sm text-brand-900 font-bold hover:underline">
                Carregar mais atividades
            </button>
            </div>
        )}
      </main>
    </div>
  );
}
