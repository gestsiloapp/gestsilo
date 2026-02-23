'use client';

import React, { useMemo } from 'react';
import {
  TrendingDown,
  CalendarClock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useRxData } from '@/lib/database/hooks';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { result: silosRaw } = useRxData('silos', c => c.find());
  const { result: events } = useRxData('events', c => c.find());
  const silosWithStock = useMemo(() => silosRaw.map(s => {
    const currentStock = events.filter(e => e.silo_id === s.id).reduce((acc, e) => acc + (e.amount_kg || 0), 0);
    const cap = s.capacity_kg ?? 1;
    const daysRemaining = cap > 0 ? Math.round((currentStock / cap) * 90) : 0;
    return { ...s, currentStock, daysRemaining };
  }), [silosRaw, events]);

  // KPIs Estratégicos
  const kpis = [
    { 
      label: "Autonomia Geral", 
      value: "38 dias", 
      trend: "-2 dias", 
      status: "warning", 
      icon: <CalendarClock size={20} /> 
    },
    { 
      label: "Custo Médio / t MS", 
      value: "R$ 280", 
      trend: "+ R$ 12", 
      status: "neutral", 
      icon: <DollarSign size={20} /> 
    },
    { 
      label: "Perdas (Mês)", 
      value: "2.4%", 
      trend: "-0.5%", 
      status: "success", 
      icon: <TrendingDown size={20} /> 
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Cabeçalho Estratégico */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-concrete-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Indicadores Estratégicos</h1>
          <p className="text-sm text-ui-muted mt-1">Análise consolidada da propriedade.</p>
        </div>
        <button className="flex items-center gap-2 bg-concrete-100 text-brand-900 px-4 py-2 rounded-xl font-bold hover:bg-brand-900 hover:text-white transition-all shadow-sm active:scale-95 text-sm">
          <Download size={16} />
          Exportar Relatório
        </button>
      </div>

      {/* 1. Grid de KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-concrete-100 shadow-sm flex items-start justify-between hover:border-earth-400 transition-colors group">
            <div>
              <p className="text-xs font-bold text-ui-muted uppercase tracking-wider mb-2 group-hover:text-brand-900 transition-colors">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-ui-text">{kpi.value}</h3>
              
              <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${
                kpi.status === 'success' ? 'text-status-success' : 
                kpi.status === 'warning' ? 'text-earth-500' : 'text-ui-muted'
              }`}>
                {kpi.status === 'success' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                <span>{kpi.trend} <span className="font-medium text-ui-muted ml-1">vs mês anterior</span></span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${kpi.status === 'warning' ? 'bg-earth-100 text-earth-500' : 'bg-concrete-100 text-brand-900'}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 2. Gráfico de Estoque Comparativo (Barras) */}
      <section className="bg-white p-8 rounded-3xl border border-concrete-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-brand-900 flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg text-brand-900">
               <BarChart3 size={20} />
            </div>
            Comparativo de Estoque
          </h2>
          <span className="text-xs text-brand-900 font-bold bg-brand-100 px-3 py-1.5 rounded-full border border-brand-900/10">Ton. Físicas</span>
        </div>
        
        <div className="space-y-8">
          {silosWithStock.map((silo) => {
            const percentage = Math.round((silo.currentStock / (silo.capacity_kg ?? 1)) * 100);
            const isCritical = percentage < 25;

            return (
              <div 
                key={silo.id} 
                onClick={() => router.push(`/silos/${silo.id}`)}
                className="group cursor-pointer"
              >
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-bold text-ui-text group-hover:text-brand-900 transition-colors text-base">{silo.name}</h4>
                  </div>
                  <div className="text-right flex items-center gap-2">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isCritical ? 'bg-red-50 text-status-danger' : 'bg-concrete-100 text-ui-muted'}`}>
                        {silo.daysRemaining} dias
                     </span>
                     <span className="text-sm font-bold text-brand-900">{silo.currentStock / 1000}t</span> {/* Convert kg to tons */}
                  </div>
                </div>
                
                {/* Barra de Progresso Customizada (Estilo Gráfico) */}
                <div className="w-full h-8 bg-concrete-100 rounded-lg overflow-hidden relative shadow-inner">
                  <div 
                    className={`h-full rounded-r-lg transition-all duration-1000 ease-out relative ${
                      isCritical ? 'bg-status-danger' : 'bg-brand-900'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                     {/* Texto dentro da barra se houver espaço */}
                     {percentage > 15 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90">
                            {percentage}%
                        </span>
                     )}
                  </div>
                  {/* Linhas de Grade Verticais */}
                  <div className="absolute inset-0 flex justify-evenly pointer-events-none">
                    <div className="w-px h-full bg-white/50" />
                    <div className="w-px h-full bg-white/50" />
                    <div className="w-px h-full bg-white/50" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Alertas de Insumos */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-2">
          <AlertTriangle size={20} className="text-earth-500" />
          <h2 className="text-lg font-bold text-brand-900">Alertas de Insumos</h2>
        </div>

        <div className="bg-earth-100/50 rounded-3xl p-6 border border-earth-100 space-y-4">
           {/* Card de Alerta */}
           <div className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-earth-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-earth-100 flex items-center justify-center text-earth-500 flex-shrink-0">
                <PieChart size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-brand-900">Inoculante Lactobacillus</h4>
                    <span className="text-[10px] font-bold bg-status-danger/10 text-status-danger px-2 py-0.5 rounded-full uppercase">Estoque Baixo</span>
                </div>
                <p className="text-sm text-ui-muted mt-1 leading-relaxed">
                    Estoque abaixo do mínimo (10un). Necessária recompra para próxima safra de Milho.
                </p>
                <button className="text-xs font-bold text-earth-500 mt-3 flex items-center gap-1 hover:underline">
                    Ver Inventário <ArrowUpRight size={12} />
                </button>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
