'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings2, ArrowDownCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SiloSelector, SiloOption } from '@/components/domain/SiloSelector';
import { useDatabase } from '@/components/providers/DatabaseProvider';
import { useRxData } from '@/lib/database/hooks';

const CONVERSION_RATES = { concha: 450, vagao: 2500, kg: 1 };
const INPUT_METHOD = { concha: 'BUCKET_COUNT' as const, vagao: 'WAGON_COUNT' as const, kg: 'MANUAL_KG' as const };
type UnitType = 'concha' | 'vagao' | 'kg';

export default function OperatorPage() {
  const router = useRouter();
  const db = useDatabase();
  const { result: silosRaw } = useRxData('silos', c => c.find());
  const { result: events } = useRxData('events', c => c.find());
  const silos: SiloOption[] = useMemo(() => silosRaw.map(s => {
    const balance = events.filter(e => e.silo_id === s.id).reduce((acc, e) => acc + (e.amount_kg || 0), 0);
    const cap = s.capacity_kg ?? 1;
    const stockLevel = Math.max(0, Math.min(100, Math.round((balance / cap) * 100)));
    return { id: s.id, name: s.name, type: s.type ?? '', stockLevel };
  }), [silosRaw, events]);

  const [selectedSilo, setSelectedSilo] = useState('');
  useEffect(() => {
    if (silos.length > 0 && (!selectedSilo || !silos.some(s => s.id === selectedSilo))) {
      setSelectedSilo(silos[0].id);
    }
  }, [silos, selectedSilo]);
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<UnitType>('concha');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedKg = amount ? parseFloat(amount) * CONVERSION_RATES[unit] : 0;

  const handleAction = async (type: 'retirada' | 'descarte') => {
    if (!amount || estimatedKg <= 0 || !db || !selectedSilo) return;
    setIsSubmitting(true);
    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const amountKg = -Math.abs(estimatedKg);
      await db.events.insert({
        client_event_id: uuidv4(),
        silo_id: selectedSilo,
        user_id: 'user_local',
        event_type: 'USAGE',
        amount_kg: amountKg,
        input_method: INPUT_METHOD[unit],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'PENDING'
      });
      setAmount('');
      alert(`${type === 'retirada' ? '✅ Retirada' : '⚠️ Descarte'} registrada!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe-area animate-fade-in">
      
      {/* 1. Header Compacto Mobile */}
      <header className="px-4 pt-4 pb-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-ui-muted hover:text-ui-text active:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={24} />
            </button>
            <div>
            <h1 className="text-xl font-bold text-brand-900 leading-none">Operação Diária</h1>
            <p className="text-xs text-ui-muted mt-1">Fazenda Santa Fé • Eduardo</p>
            </div>
        </div>
        <div className="flex flex-col items-center gap-1">
             <div className="h-2.5 w-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
             <span className="text-[10px] font-bold text-status-success">ONLINE</span>
        </div>
      </header>

      {/* 2. Seleção de Silo  */}
      <section className="mt-6">
        <h2 className="px-4 text-sm font-bold text-ui-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">1</span>
            Selecione a Origem
        </h2>
        <SiloSelector 
          silos={silos} 
          selectedId={selectedSilo} 
          onSelect={setSelectedSilo} 
        />
      </section>

      {/* 3. Input de Quantidade e Unidade */}
      <section className="mt-8 px-4 flex-1">
        <h2 className="text-sm font-bold text-ui-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">2</span>
            Informe a Quantidade
        </h2>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          
          {/* Tabs de Unidade (Seguindo Lei de Fitts - Áreas Grandes) */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {(['concha', 'vagao', 'kg'] as UnitType[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                  unit === u 
                  ? 'bg-white text-brand-900 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {u === 'vagao' ? 'vagão' : u}
              </button>
            ))}
          </div>

          {/* Campo Numérico Gigante */}
          <div className="relative py-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-center text-7xl font-bold text-brand-900 placeholder:text-slate-200 outline-none bg-transparent"
              inputMode="decimal"
            />
            <div className="text-center mt-4 text-ui-muted font-medium flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-lg mx-auto max-w-[200px]">
              <Settings2 size={14} className="text-brand-500" />
              <span>≈ {estimatedKg.toLocaleString()} kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Botões de Ação Rápida (Bottom Sheet fixo) */}
      <div className="p-4 grid grid-cols-2 gap-4 mt-auto bg-white border-t border-slate-100 pb-safe">
        {/* Botão de Descarte */}
        <button
          disabled={isSubmitting}
          onClick={() => handleAction('descarte')}
          className="group flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-red-50 text-status-danger font-bold border-2 border-transparent active:scale-95 active:border-status-danger hover:bg-red-100 transition-all"
        >
          <Trash2 size={28} className="group-active:scale-110 transition-transform mb-1"/>
          <span>Descarte</span>
        </button>

        {/* Botão de Retirada (Destaque Principal) */}
        <button
          disabled={isSubmitting}
          onClick={() => handleAction('retirada')}
          className="group flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-brand-900 text-white font-bold shadow-lg shadow-brand-900/30 active:scale-95 active:shadow-none hover:bg-brand-700 transition-all"
        >
          <ArrowDownCircle size={28} className="group-active:translate-y-1 transition-transform mb-1" />
          <span>Registrar Trato</span>
        </button>
      </div>
    </div>
  );
}
