'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, FlaskConical, TrendingUp, AlertCircle, Save, Scale, Pencil, FileClock, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { useRxData, useRxCollectionByName } from '@/lib/database/hooks';
import { useSiloBalance } from '@/hooks/useSiloBalance';
import { SiloDocType } from '@/lib/database/schema';
import { AnalysisDocType } from '@/lib/database/analysis.schema';

export default function SiloDetails() {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'history'>('overview');
  const [showChart, setShowChart] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { result: silos, isFetching: fetchingSilo } = useRxData<SiloDocType>(
    'silos',
    collection => collection.find({ selector: { id } }),
    [id]
  );

  const { result: analysesHistory } = useRxData<AnalysisDocType>(
    'analyses',
    collection => collection.find({ selector: { silo_id: id } }).sort({ created_at: 'desc' }),
    [id]
  );

  const analysisCollection = useRxCollectionByName('analyses');
  const { balance } = useSiloBalance(id);

  const silo = silos[0];
  const latestAnalysis = analysesHistory.length > 0 ? analysesHistory[0] : null;

  const [analysisForm, setAnalysisForm] = useState({
    dryMatter: 0,
    ph: 0,
    starch: 0,
    protein: 0,
    ndt: 0,
    fdn: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (latestAnalysis) {
      setAnalysisForm(prev => ({
        ...prev,
        dryMatter: latestAnalysis.dryMatter ?? 0,
        ph: latestAnalysis.ph ?? 0,
        starch: latestAnalysis.starch ?? 0,
        protein: latestAnalysis.protein ?? 0,
        ndt: latestAnalysis.ndt ?? 0,
        fdn: latestAnalysis.fdn ?? 0,
      }));
    }
  }, [latestAnalysis]);

  const handleSaveAnalysis = async () => {
    if (!analysisCollection) return;
    setIsSaving(true);

    try {
      await analysisCollection.insert({
        id: crypto.randomUUID(),
        silo_id: id,
        date: analysisForm.date,
        lab: 'Registro Interno (App)',
        dryMatter: analysisForm.dryMatter,
        ph: analysisForm.ph,
        starch: analysisForm.starch,
        protein: analysisForm.protein,
        ndt: analysisForm.ndt,
        fdn: analysisForm.fdn,
        status: 'current',
        created_at: new Date().toISOString()
      });

      alert("✅ Análise salva com sucesso!");
      setActiveTab('overview');
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      alert("Erro ao salvar a análise. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (fetchingSilo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-900">
        <Loader2 className="animate-spin mb-5" size={48} />
        <p className="font-bold text-lg">Carregando informações do silo...</p>
      </div>
    );
  }

  if (!silo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <AlertCircle size={52} className="mb-5 text-concrete-300" />
        <p className="text-2xl font-bold text-brand-900">Silo não encontrado</p>
        <button onClick={() => router.back()} className="mt-5 px-6 py-3 bg-brand-900 text-white rounded-xl font-bold text-base">Voltar</button>
      </div>
    );
  }

  const currentStock = balance;
  const maxCapacity = silo.capacity_kg ?? 1;
  const percentage = Math.min(Math.round((currentStock / maxCapacity) * 100), 100);
  const siloType = silo.type === 'bunker' ? 'Trincheira' : silo.type === 'bag' ? 'Bolsa' : silo.type || 'Silo';

  const chartData = [...analysesHistory].reverse();

  return (
    <div className="space-y-6 animate-fade-in w-full">

      <div className="flex items-center gap-5 mb-7">
        <button onClick={() => router.back()} className="p-2.5 bg-white border border-concrete-100 rounded-xl hover:bg-slate-50 transition-colors text-brand-900 shadow-sm">
          <ArrowLeft size={22} />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold text-brand-900 tracking-tight">{silo.name || 'Silo Sem Nome'}</h1>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-500 bg-earth-100 px-2 py-0.5 rounded-full border border-earth-200">
              {siloType}
            </span>
          </div>
          <p className="text-slate-500 text-base mt-1.5">ID: {silo.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-concrete-100 overflow-hidden min-h-[600px] flex flex-col">

        <div className="flex border-b border-concrete-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('overview')} className={`px-5 md:px-9 py-6 text-base font-bold tracking-wide border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 ${activeTab === 'overview' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}>
            <Scale size={20} className={activeTab === 'overview' ? 'text-earth-500' : 'text-slate-400'} /> Visão Geral
          </button>
          <button onClick={() => setActiveTab('analysis')} className={`px-5 md:px-9 py-6 text-base font-bold tracking-wide border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 ${activeTab === 'analysis' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}>
            <FlaskConical size={20} className={activeTab === 'analysis' ? 'text-earth-500' : 'text-slate-400'} /> Nova Análise
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-5 md:px-9 py-6 text-base font-bold tracking-wide border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap flex-shrink-0 ${activeTab === 'history' ? 'border-brand-900 text-brand-900 bg-white' : 'border-transparent text-slate-400 hover:text-brand-900 hover:bg-white/50'}`}>
            <FileClock size={20} className={activeTab === 'history' ? 'text-earth-500' : 'text-slate-400'} /> Histórico ({analysesHistory.length})
          </button>
        </div>

        <div className="p-5 md:p-9 bg-white flex-1">

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-concrete-50 p-7 rounded-2xl border border-concrete-100">
                  <div className="flex justify-between items-end mb-7">
                    <div>
                      <h3 className="text-base font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estoque Atual</h3>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-5xl font-bold text-brand-900">{currentStock.toLocaleString('pt-BR')} kg</span>
                        <span className="text-xl text-slate-400 font-medium">/ {maxCapacity.toLocaleString('pt-BR')} kg</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${percentage < 20 ? 'text-red-500' : 'text-brand-500'}`}>{percentage}%</span>
                      <p className="text-sm text-slate-400">Ocupação</p>
                    </div>
                  </div>
                  <div className="w-full bg-concrete-200 rounded-full h-9 overflow-hidden mb-5 relative shadow-inner">
                    <div className={`h-full rounded-full ${percentage < 20 ? "bg-red-500" : "bg-earth-500"} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-concrete-100 flex items-center gap-5 hover:border-earth-400 transition-colors">
                    <div className="text-brand-900 bg-brand-100 w-14 h-14 rounded-xl flex items-center justify-center"><Calendar size={26} /></div>
                    <div>
                      <p className="text-sm text-slate-400 uppercase font-bold">Data de Criação</p>
                      <p className="font-bold text-slate-800 text-xl">{silo.created_at ? new Date(silo.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-concrete-100" />

              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-5 mb-7">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight flex items-center gap-2.5">
                    <FlaskConical size={22} className="text-earth-500" /> Última Análise
                  </h3>
                  <button onClick={() => setActiveTab('analysis')} className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-base font-bold text-brand-900 bg-concrete-100 hover:bg-earth-100 hover:text-earth-500 transition-colors">
                    <Pencil size={18} /> Atualizar Qualidade
                  </button>
                </div>

                {latestAnalysis ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <QualityIndicator label="Matéria Seca" value={latestAnalysis.dryMatter ?? 0} unit="%" ideal="30-35" />
                    <QualityIndicator label="pH" value={latestAnalysis.ph ?? 0} unit="" ideal="3.8-4.2" invertColor />
                    <QualityIndicator label="Amido" value={latestAnalysis.starch ?? 0} unit="%" ideal="> 30" />
                    <QualityIndicator label="Energia (NDT)" value={latestAnalysis.ndt ?? 0} unit="%" ideal="> 68" />
                  </div>
                ) : (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FlaskConical size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium text-base">Nenhuma análise cadastrada para este silo.</p>
                    <button onClick={() => setActiveTab('analysis')} className="mt-5 text-brand-900 font-bold text-base hover:underline">Registrar Primeira Análise</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-8 animate-fade-in w-full">
              <div className="bg-earth-100 border border-earth-400/30 rounded-xl p-5 flex gap-5 items-start">
                <AlertCircle className="text-earth-600 shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="text-base font-bold text-earth-700">Registro de Laudo</h4>
                  <p className="text-base text-earth-700/80 mt-1.5">
                    Os dados salvos aqui serão adicionados ao histórico do silo e atualizarão os indicadores da visão geral.
                  </p>
                </div>
              </div>

              <form className="bg-white p-9 rounded-2xl shadow-sm border border-concrete-100 space-y-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2.5">Data do Laudo</label>
                    <input type="date" value={analysisForm.date} onChange={e => setAnalysisForm({ ...analysisForm, date: (e.target as unknown as { value: string }).value })} className="w-full p-4 rounded-xl border border-concrete-200 bg-white font-medium text-base focus:outline-none focus:ring-2 focus:ring-earth-400" />
                  </div>
                  <div className="hidden md:block"></div>

                  <InputMetric label="Matéria Seca (MS)" value={analysisForm.dryMatter} unit="%" onChange={(v: number) => setAnalysisForm({ ...analysisForm, dryMatter: v })} />
                  <InputMetric label="Potencial Hidro. (pH)" value={analysisForm.ph} unit="" onChange={(v: number) => setAnalysisForm({ ...analysisForm, ph: v })} />
                  <InputMetric label="Amido" value={analysisForm.starch} unit="%" onChange={(v: number) => setAnalysisForm({ ...analysisForm, starch: v })} />
                  <InputMetric label="Proteína Bruta (PB)" value={analysisForm.protein} unit="%" onChange={(v: number) => setAnalysisForm({ ...analysisForm, protein: v })} />
                  <InputMetric label="Fibra (FDN)" value={analysisForm.fdn} unit="%" onChange={(v: number) => setAnalysisForm({ ...analysisForm, fdn: v })} />
                  <InputMetric label="Energia (NDT)" value={analysisForm.ndt} unit="%" onChange={(v: number) => setAnalysisForm({ ...analysisForm, ndt: v })} />
                </div>

                <div className="pt-7 border-t border-concrete-100 flex justify-end gap-5">
                  <button type="button" onClick={() => setActiveTab('overview')} className="px-7 py-3.5 rounded-xl font-bold text-base text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button type="button" onClick={handleSaveAnalysis} disabled={isSaving} className="flex items-center justify-center gap-2.5 bg-brand-900 text-white font-bold px-9 py-3.5 rounded-xl text-base hover:bg-brand-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
                    Salvar Laudo
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-7 animate-fade-in w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">Histórico de Qualidade</h3>
                  <p className="text-base text-slate-500 mt-1">Acompanhe a evolução nutricional do silo.</p>
                </div>
                {analysesHistory.length > 0 && (
                  <button onClick={() => setShowChart(!showChart)} className={`text-base font-bold flex items-center gap-2.5 transition-colors px-5 py-2.5 rounded-xl ${showChart ? 'bg-earth-100 text-earth-600' : 'text-earth-600 hover:bg-earth-50'}`}>
                    <TrendingUp size={20} /> {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico Evolutivo'}
                  </button>
                )}
              </div>

              {analysesHistory.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium text-base">O histórico está vazio.</p>
                </div>
              ) : (
                <>
                  {showChart && (
                    <div className="bg-white p-7 rounded-3xl border border-concrete-100 shadow-sm animate-fade-in mb-7 relative">
                      <h4 className="text-base font-bold text-brand-900 mb-5 flex items-center gap-2.5">
                        <Scale size={20} /> Evolução da Matéria Seca (%)
                      </h4>
                      <div className="h-48 w-full flex items-end justify-between px-2 gap-2 relative">
                        <div className="absolute left-0 right-0 bottom-[32%] border-t border-dashed border-brand-500/30"><span className="text-[10px] text-brand-500 bg-white px-1 relative -top-3">30%</span></div>
                        <div className="absolute left-0 right-0 bottom-[37%] border-t border-dashed border-brand-500/30"><span className="text-[10px] text-brand-500 bg-white px-1 relative -top-3">35%</span></div>

                        {chartData.map((data) => {
                          const height = Math.min(((data.dryMatter ?? 0) / 50) * 100, 100);
                          return (
                            <div key={data.id} className="flex flex-col items-center justify-end h-full w-full group relative">
                              <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[100%] bg-brand-900 text-white text-[10px] py-1 px-2 rounded font-bold">
                                {data.dryMatter}%
                              </div>
                              <div className="w-3 md:w-4 rounded-t-full transition-all duration-500 bg-brand-500/50 hover:bg-brand-500" style={{ height: `${height}%` }}></div>
                              <div className="mt-2 text-[10px] font-bold text-slate-400">
                                {new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {analysesHistory.map((item, index) => {
                      const isCurrent = index === 0;
                      const isExpanded = expandedHistoryId === item.id;

                      return (
                        <div key={item.id} onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)} className={`group relative bg-white rounded-2xl border transition-all cursor-pointer ${isCurrent ? 'border-brand-900/20 bg-brand-50/30' : 'border-concrete-100 hover:border-earth-300'} ${isExpanded ? 'shadow-md ring-1 ring-earth-400/20' : ''}`}>
                          <div className="p-6">
                            {isCurrent && (
                              <div className="absolute top-5 right-12 md:right-5 text-sm font-bold text-brand-900 bg-brand-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <CheckCircle2 size={14} /> Atual
                              </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base shadow-sm transition-colors ${isCurrent ? 'bg-brand-900 text-white' : 'bg-concrete-100 text-slate-500'}`}>
                                  {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-400 uppercase">{item.lab}</p>
                                  <p className="font-bold text-brand-900 text-xl flex items-center gap-2">
                                    {new Date(item.date).getFullYear()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-1 grid grid-cols-3 gap-3 md:max-w-md">
                                <div className="text-center p-3 rounded-xl bg-white/50 border border-transparent group-hover:border-concrete-200">
                                  <span className="block text-xs text-slate-400 font-bold uppercase">Matéria Seca</span>
                                  <span className="text-lg font-bold text-brand-900">{item.dryMatter}%</span>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/50 border border-transparent group-hover:border-concrete-200">
                                  <span className="block text-xs text-slate-400 font-bold uppercase">pH</span>
                                  <span className="text-lg font-bold text-brand-900">{item.ph}</span>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/50 border border-transparent group-hover:border-concrete-200">
                                  <span className="block text-xs text-slate-400 font-bold uppercase">Prot. Bruta</span>
                                  <span className="text-lg font-bold text-brand-900">{item.protein}%</span>
                                </div>
                              </div>

                              <div className="absolute top-6 right-5 md:static md:block text-slate-400 group-hover:text-brand-900">
                                {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-6 pb-6 pt-0 animate-fade-in border-t border-dashed border-concrete-200 mt-2">
                              <div className="pt-5 grid grid-cols-3 gap-5">
                                <div className="bg-concrete-50 p-4 rounded-xl">
                                  <p className="text-xs uppercase font-bold text-slate-400 mb-1.5">Amido</p>
                                  <p className="font-bold text-brand-900 text-lg">{item.starch}%</p>
                                </div>
                                <div className="bg-concrete-50 p-4 rounded-xl">
                                  <p className="text-xs uppercase font-bold text-slate-400 mb-1.5">Energia (NDT)</p>
                                  <p className="font-bold text-brand-900 text-lg">{item.ndt}%</p>
                                </div>
                                <div className="bg-concrete-50 p-4 rounded-xl">
                                  <p className="text-xs uppercase font-bold text-slate-400 mb-1.5">Fibra (FDN)</p>
                                  <p className="font-bold text-brand-900 text-lg">{item.fdn}%</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const QualityIndicator = ({ label, value, unit, ideal }: { label: string; value: number; unit: string; ideal: string; invertColor?: boolean }) => (
  <div className="p-7 bg-white rounded-2xl border border-concrete-200 text-center shadow-sm">
    <p className="text-base text-slate-400 uppercase font-bold mb-3">{label}</p>
    <div className="flex items-center justify-center gap-2">
      <span className="text-5xl font-bold text-brand-900">{value}</span>
      <span className="text-lg font-bold text-slate-400 self-end mb-1">{unit}</span>
    </div>
    <div className="mt-5 inline-block px-4 py-2 bg-concrete-100 rounded-lg text-sm font-bold text-slate-500">
      Meta: {ideal}
    </div>
  </div>
);

const InputMetric = ({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) => (
  <div>
    <label className="block text-base font-bold text-slate-500 uppercase mb-3">{label}</label>
    <div className="relative group">
      <input type="number" step="0.1" value={value || ''} onChange={e => onChange(parseFloat((e.target as unknown as { value: string }).value) || 0)} className="w-full p-6 rounded-xl border border-concrete-200 bg-white font-bold text-2xl text-brand-900 focus:outline-none focus:border-earth-400 focus:ring-1 focus:ring-earth-400 transition-colors" placeholder="0.0" />
      {unit && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-concrete-400 font-bold">{unit}</span>}
    </div>
  </div>
);
