'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, FlaskConical, TrendingUp, AlertCircle, Save, History, Scale, Pencil, FileClock, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { RxCollection } from 'rxdb';
import { useRxData } from '@/lib/database/hooks';
import { useSiloBalance } from '@/hooks/useSiloBalance';
import { SiloDocType } from '@/lib/database/schema';

// Mock de histórico expandido (No futuro, pode virar uma tabela no RxDB)
const MOCK_ANALYSIS_HISTORY = [
  { id: 1, date: '2024-01-10', lab: 'Lab NutriSolo', dryMatter: 32.5, ph: 3.8, protein: 7.8, starch: 35.2, ndt: 72.0, fdn: 48.5, status: 'current' },
  { id: 2, date: '2023-12-15', lab: 'Lab NutriSolo', dryMatter: 31.0, ph: 4.0, protein: 7.5, starch: 34.0, ndt: 70.5, fdn: 49.0, status: 'archived' },
  { id: 3, date: '2023-11-20', lab: 'Análise Rápida (Fazenda)', dryMatter: 29.8, ph: 4.2, protein: 7.2, starch: 32.5, ndt: 69.8, fdn: 50.2, status: 'archived' },
  { id: 4, date: '2023-10-05', lab: 'Lab NutriSolo', dryMatter: 33.2, ph: 3.9, protein: 8.1, starch: 36.0, ndt: 73.0, fdn: 47.8, status: 'archived' },
];

export default function SiloDetails() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'history'>('overview');
  const [showChart, setShowChart] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  // Busca o silo pelo ID da URL
  const { result: silos, isFetching } = useRxData<SiloDocType>('silos', (collection: RxCollection<unknown>) =>
    collection.find({ selector: { id: id ?? '' } })
  );
  const { balance } = useSiloBalance(id ?? '');

  const silo = silos[0];

  const [analysis, setAnalysis] = useState({
    dryMatter: 0, ph: 0, starch: 0, protein: 0, ndt: 0, fdn: 0, date: new Date().toISOString().split('T')[0]
  });

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-900">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold">Carregando informações do silo...</p>
      </div>
    );
  }

  if (!silo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-ui-muted">
        <AlertCircle size={48} className="mb-4 text-concrete-400" />
        <p className="text-xl font-bold text-brand-900">Silo não encontrado</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-brand-900 text-white rounded-lg font-bold">Voltar</button>
      </div>
    );
  }

  // Cálculos: RxDB usa capacity_kg e balance (soma de events em kg)
  const currentStock = Math.round(balance / 1000); // kg -> toneladas
  const maxCapacity = Math.round((silo.capacity_kg ?? 0) / 1000); // kg -> toneladas
  const percentage = maxCapacity > 0 ? Math.round((currentStock / maxCapacity) * 100) : 0;
  const siloType = silo.type === 'bunker' ? 'Trincheira' : silo.type === 'bag' ? 'Bolsa' : silo.type || 'Silo';
  const siloStatus = 'open'; // RxDB schema não tem status; assumimos aberto

  const chartData = [...MOCK_ANALYSIS_HISTORY].reverse();

  return (
    <div className="space-y-6 animate-fade-in pb-10 mt-6">

      {/* Barra de Navegação Superior */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-concrete-100 rounded-lg hover:bg-slate-50 hover:border-brand-900 transition-colors text-brand-900 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-900 tracking-tight">{silo.name || 'Silo Sem Nome'}</h1>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-500 bg-earth-100 px-2 py-0.5 rounded-full border border-earth-200">
              {siloType}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${siloStatus === 'open' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
              {siloStatus === 'open' ? 'Aberto' : 'Fechado'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">ID: {silo.id}</p>
        </div>
      </div>

      {/* Container Principal */}
      <div className="bg-white rounded-3xl shadow-sm border border-concrete-100 overflow-hidden min-h-[600px] flex flex-col">

        {/* Tabs de Navegação Interna */}
        <div className="flex border-b border-concrete-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 md:px-8 py-5 text-sm font-bold tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'overview' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}
          >
            <Scale size={18} className={activeTab === 'overview' ? 'text-earth-500' : 'text-slate-400'} />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 md:px-8 py-5 text-sm font-bold tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'analysis' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}
          >
            <FlaskConical size={18} className={activeTab === 'analysis' ? 'text-earth-500' : 'text-slate-400'} />
            Análise de Laboratório
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 md:px-8 py-5 text-sm font-bold tracking-wide border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === 'history' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}
          >
            <FileClock size={18} className={activeTab === 'history' ? 'text-earth-500' : 'text-slate-400'} />
            Histórico de Análises
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 md:p-8 bg-white flex-1">

          {/* TAB: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in max-w-5xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-concrete-50 p-6 rounded-2xl border border-concrete-100">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Nível do Silo</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-brand-900">{currentStock}t</span>
                        <span className="text-lg text-slate-400 font-medium">/ {maxCapacity}t</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${percentage < 20 ? 'text-red-500' : 'text-brand-500'}`}>{percentage}%</span>
                      <p className="text-xs text-slate-400">Ocupação</p>
                    </div>
                  </div>
                  <div className="w-full bg-concrete-200 rounded-full h-8 overflow-hidden mb-4 relative shadow-inner">
                    <div className="absolute top-0 bottom-0 left-[25%] border-r border-white/50 z-10"></div>
                    <div className="absolute top-0 bottom-0 left-[50%] border-r border-white/50 z-10"></div>
                    <div className="absolute top-0 bottom-0 left-[75%] border-r border-white/50 z-10"></div>
                    <div className={`h-full rounded-full ${percentage < 20 ? "bg-red-500" : "bg-earth-500"} transition-all duration-1000 relative`} style={{ width: `${percentage}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Capacidade Total: <strong>{maxCapacity} Toneladas</strong></span>
                    {siloStatus === 'open' && <p className="text-brand-700 font-medium bg-brand-100 px-3 py-1 rounded-lg">Em consumo</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-concrete-100 flex items-center gap-4 hover:border-earth-400 transition-colors">
                    <div className="text-brand-900 bg-brand-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"><Calendar size={22} /></div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Data de Criação</p>
                      <p className="font-bold text-slate-800 text-lg">{silo.created_at ? new Date(silo.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-concrete-100 flex items-center gap-4 hover:border-earth-400 transition-colors">
                    <div className="text-earth-500 bg-earth-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"><History size={22} /></div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Status Atual</p>
                      <p className="font-bold text-slate-800 text-lg capitalize">{siloStatus === 'open' ? 'Aberto / Em uso' : 'Fechado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-concrete-100" />

              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold text-brand-900 tracking-tight flex items-center gap-2">
                    <FlaskConical size={20} className="text-earth-500" /> Qualidade da Silagem
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setActiveTab('history')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 bg-white border border-concrete-200 hover:border-brand-900 hover:text-brand-900 hover:bg-slate-50 transition-all shadow-sm">
                      <History size={16} /> Ver Histórico
                    </button>
                    <button onClick={() => setActiveTab('analysis')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-brand-900 bg-concrete-100 hover:bg-earth-100 hover:text-earth-500 transition-colors">
                      <Pencil size={14} /> Atualizar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <QualityIndicator label="Matéria Seca" value={32.5} unit="%" ideal="30-35" />
                  <QualityIndicator label="pH" value={3.8} unit="" ideal="3.8-4.2" invertColor />
                  <QualityIndicator label="Amido" value={35.2} unit="%" ideal="> 30" />
                  <QualityIndicator label="Energia (NDT)" value={72.0} unit="%" ideal="> 68" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANÁLISE BROMATOLÓGICA */}
          {activeTab === 'analysis' && (
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
              <div className="bg-earth-100 border border-earth-400/30 rounded-xl p-4 flex gap-4 items-start">
                <AlertCircle className="text-earth-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-earth-600">Importante</h4>
                  <p className="text-sm text-earth-600/80 mt-1">Atualize os dados com base no laudo laboratorial mais recente. Essas informações impactam diretamente o cálculo da dieta.</p>
                </div>
              </div>
              <form className="bg-white p-8 rounded-2xl shadow-sm border border-concrete-100 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data da Coleta</label>
                    <input type="date" value={analysis.date} onChange={e => setAnalysis({ ...analysis, date: e.target.value })} className="w-full p-3 rounded-xl border border-concrete-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-earth-400" />
                  </div>
                  <div className="hidden md:block"></div>
                  <InputMetric label="Matéria Seca (MS)" value={analysis.dryMatter} unit="%" onChange={(v: number) => setAnalysis({ ...analysis, dryMatter: v })} />
                  <InputMetric label="Potencial Hidro. (pH)" value={analysis.ph} unit="" onChange={(v: number) => setAnalysis({ ...analysis, ph: v })} />
                  <InputMetric label="Amido" value={analysis.starch} unit="%" onChange={(v: number) => setAnalysis({ ...analysis, starch: v })} />
                  <InputMetric label="Proteína Bruta (PB)" value={analysis.protein} unit="%" onChange={(v: number) => setAnalysis({ ...analysis, protein: v })} />
                </div>
                <div className="pt-6 border-t border-concrete-100 flex justify-end gap-4">
                  <button type="button" onClick={() => setActiveTab('overview')} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button type="button" onClick={() => { alert("Dados simulados salvos!"); setActiveTab('overview'); }} className="flex items-center justify-center gap-2 bg-brand-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-800 transition-all shadow-lg">
                    <Save size={20} /> Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: HISTÓRICO DE ANÁLISES */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-900">Histórico de Qualidade</h3>
                  <p className="text-sm text-slate-500">Registro das últimas coletas realizadas.</p>
                </div>
                <button onClick={() => setShowChart(!showChart)} className={`text-sm font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg ${showChart ? 'bg-earth-100 text-earth-600' : 'text-earth-600 hover:bg-earth-50'}`}>
                  <TrendingUp size={16} /> {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico Evolutivo'}
                </button>
              </div>

              {showChart && (
                <div className="bg-white p-6 rounded-3xl border border-concrete-100 shadow-sm animate-fade-in mb-6 relative">
                  <h4 className="text-sm font-bold text-brand-900 mb-4 flex items-center gap-2"><Scale size={16} /> Evolução da Matéria Seca (%)</h4>
                  <div className="h-48 w-full flex items-end justify-between px-2 gap-2 relative">
                    <div className="absolute left-0 right-0 bottom-[32%] border-t border-dashed border-brand-500/30"><span className="text-[10px] text-brand-500 bg-white px-1 relative -top-3">30%</span></div>
                    <div className="absolute left-0 right-0 bottom-[37%] border-t border-dashed border-brand-500/30"><span className="text-[10px] text-brand-500 bg-white px-1 relative -top-3">35%</span></div>
                    {chartData.map((data) => {
                      const height = Math.min((data.dryMatter / 50) * 100, 100);
                      return (
                        <div key={data.id} className="flex flex-col items-center justify-end h-full w-full group relative">
                          <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[100%] bg-brand-900 text-white text-[10px] py-1 px-2 rounded font-bold">{data.dryMatter}%</div>
                          <div className={`w-3 md:w-4 rounded-t-full transition-all duration-500 ${data.status === 'current' ? 'bg-brand-900' : 'bg-brand-500/50 hover:bg-brand-500'}`} style={{ height: `${height}%` }}></div>
                          <div className="mt-2 text-[10px] font-bold text-slate-400">{new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {MOCK_ANALYSIS_HISTORY.map((item) => {
                  const isCurrent = item.status === 'current';
                  const isExpanded = expandedHistoryId === item.id;
                  return (
                    <div key={item.id} onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)} className={`group relative bg-white rounded-2xl border transition-all cursor-pointer ${isCurrent ? 'border-brand-900/20 bg-brand-50/30' : 'border-concrete-100 hover:border-earth-300'} ${isExpanded ? 'shadow-md ring-1 ring-earth-400/20' : ''}`}>
                      <div className="p-5">
                        {isCurrent && <div className="absolute top-4 right-12 md:right-4 text-xs font-bold text-brand-900 bg-brand-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Atual</div>}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${isCurrent ? 'bg-brand-900 text-white' : 'bg-concrete-100 text-slate-500 group-hover:bg-earth-100 group-hover:text-earth-600'}`}>
                              {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase">{item.lab}</p>
                              <p className="font-bold text-brand-900 text-lg flex items-center gap-2">{new Date(item.date).getFullYear()}</p>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2 md:max-w-md">
                            <div className="text-center p-2 rounded-lg bg-white/50 border border-transparent group-hover:border-concrete-200 transition-all">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">Matéria Seca</span>
                              <span className="text-base font-bold text-brand-900">{item.dryMatter}%</span>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/50 border border-transparent group-hover:border-concrete-200 transition-all">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">pH</span>
                              <span className="text-base font-bold text-brand-900">{item.ph}</span>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/50 border border-transparent group-hover:border-concrete-200 transition-all">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">Prot. Bruta</span>
                              <span className="text-base font-bold text-brand-900">{item.protein}%</span>
                            </div>
                          </div>
                          <div className="absolute top-5 right-4 md:static md:block">
                            <button className="p-2 text-concrete-500 group-hover:text-brand-900 rounded-full transition-colors">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 animate-fade-in border-t border-dashed border-concrete-200 mt-2">
                          <div className="pt-4 grid grid-cols-3 gap-4">
                            <div className="bg-concrete-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Amido</p><p className="font-bold text-brand-900">{item.starch}%</p></div>
                            <div className="bg-concrete-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Energia (NDT)</p><p className="font-bold text-brand-900">{item.ndt}%</p></div>
                            <div className="bg-concrete-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Fibra (FDN)</p><p className="font-bold text-brand-900">{item.fdn}%</p></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const QualityIndicator = ({ label, value, unit, ideal }: { label: string; value: number; unit: string; ideal: string; invertColor?: boolean }) => (
  <div className="p-5 bg-white rounded-2xl border border-concrete-200 text-center hover:border-earth-400 transition-colors group shadow-sm">
    <p className="text-xs text-slate-400 uppercase font-bold mb-2 group-hover:text-brand-900 transition-colors">{label}</p>
    <div className="flex items-center justify-center gap-1">
      <span className="text-3xl font-bold text-brand-900">{value}</span>
      <span className="text-sm font-bold text-slate-400 self-end mb-1">{unit}</span>
    </div>
    <div className="mt-3 inline-block px-2 py-1 bg-concrete-100 rounded text-[10px] font-bold text-slate-500">Meta: {ideal}</div>
  </div>
);

const InputMetric = ({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
    <div className="relative group">
      <input type="number" step="0.1" value={value || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="w-full p-4 rounded-xl border border-concrete-200 bg-white font-bold text-xl text-brand-900 focus:outline-none focus:border-earth-400 focus:ring-1 focus:ring-earth-400 transition-colors" placeholder="0.0" />
      {unit && <span className="absolute right-4 top-5 text-sm text-concrete-400 font-bold">{unit}</span>}
    </div>
  </div>
);
