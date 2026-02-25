'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, ArrowDownCircle, Trash2, ChevronLeft, CheckCircle2, Loader2, Database } from 'lucide-react';
import { useRxData } from '@/lib/database/hooks';
import { useSiloBalance } from '@/hooks/useSiloBalance';
import { getDatabase } from '@/lib/database/db';
import { SiloDocType } from '@/lib/database/schema';
import { v4 as uuidv4 } from 'uuid';

// Fatores de conversão (Futuramente virão do SettingsPage)
const CONVERSION_RATES = {
  concha: 450, // 1 concha = 450kg
  vagao: 2500, // 1 vagão = 2500kg
  kg: 1
};

type UnitType = 'concha' | 'vagao' | 'kg';

// --- COMPONENTE INLINE: Cartão do Silo ---
const SiloSelectorCard = ({ silo, isSelected, onSelect }: { silo: SiloDocType; isSelected: boolean; onSelect: () => void }) => {
  const { balance } = useSiloBalance(silo.id);
  const capacity = silo.capacity_kg || 1;
  const currentStock = balance;
  const stockLevel = Math.min(Math.round((currentStock / capacity) * 100), 100);

  const siloType = silo.type === 'bunker' ? 'Trincheira' : silo.type === 'bag' ? 'Bolsa' : silo.type || 'Silo';

  return (
    <button
      onClick={onSelect}
      className={`
        relative flex-shrink-0 w-40 h-32 rounded-2xl p-4 text-left flex flex-col justify-between transition-all duration-200 snap-center border focus:outline-none
        ${isSelected
          ? 'bg-brand-900 ring-2 ring-offset-2 ring-brand-900 shadow-lg scale-105 border-transparent'
          : 'bg-white border-concrete-200 shadow-sm hover:border-brand-300'}
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full">
          <CheckCircle2 size={24} fill="currentColor" className="text-green-500" />
        </div>
      )}

      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
          {siloType}
        </span>
        <h3 className={`text-lg font-bold leading-tight mt-1 truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
          {silo.name || 'Sem Nome'}
        </h3>
      </div>

      <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full ${isSelected ? 'bg-green-400' : 'bg-brand-500'}`}
          style={{ width: `${stockLevel}%` }}
        />
      </div>
    </button>
  );
};

export default function OperatorMode() {
  const router = useRouter();

  const { result: silos, isFetching } = useRxData<SiloDocType>('silos', collection =>
    collection.find().sort({ created_at: 'desc' })
  );

  const [selectedSilo, setSelectedSilo] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<UnitType>('concha');

  useEffect(() => {
    if (silos.length > 0 && !selectedSilo) {
      setSelectedSilo(silos[0].id);
    }
  }, [silos, selectedSilo]);

  const estimatedKg = amount ? (parseFloat(amount) * CONVERSION_RATES[unit]) : 0;

  const handleAction = async (type: 'retirada' | 'descarte') => {
    if (!amount || parseFloat(amount) <= 0 || !selectedSilo) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);

    const amountKg = parseFloat(amount) * CONVERSION_RATES[unit];

    try {
      const db = await getDatabase();
      if (!db) throw new Error("Banco de dados local indisponível.");

      const eventPayload = {
        client_event_id: uuidv4(),
        silo_id: selectedSilo,
        user_id: 'local_operator_id',
        event_type: (type === 'retirada' ? 'USAGE' : 'COMPENSATION') as 'USAGE' | 'COMPENSATION',
        amount_kg: -Math.abs(amountKg),
        input_method: (unit === 'kg' ? 'MANUAL_KG' : unit === 'concha' ? 'BUCKET_COUNT' : 'WAGON_COUNT') as 'MANUAL_KG' | 'BUCKET_COUNT' | 'WAGON_COUNT',
        sync_status: 'PENDING' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.events.insert(eventPayload);

      alert(`${type === 'retirada' ? '✅ Retirada' : '⚠️ Descarte'} de ${amount} ${unit === 'vagao' ? 'vagões' : unit + 's'} registrada!`);
      setAmount('');
    } catch (error) {
      console.error("Erro ao registrar operação:", error);
      alert("Falha ao registrar operação localmente.");
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-brand-900">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold">Carregando modo operador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe-area animate-fade-in -mt-6">

      {/* 1. Header Compacto Mobile */}
      <header className="px-4 pt-6 pb-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-brand-900 active:bg-slate-100 rounded-full transition-colors focus:outline-none">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-900 leading-none">Operação Diária</h1>
            <p className="text-xs text-slate-500 mt-1">Fazenda Santa Fé • Campo</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-[10px] font-bold text-green-600">ONLINE</span>
        </div>
      </header>

      {/* 2. Seleção de Silo */}
      <section className="mt-6">
        <h2 className="px-4 text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">1</span>
          Selecione a Origem
        </h2>

        {silos.length === 0 ? (
          <div className="mx-4 p-6 bg-white rounded-2xl border border-dashed border-concrete-300 text-center">
            <Database className="mx-auto text-slate-300 mb-2" size={24} />
            <p className="text-sm font-bold text-slate-500">Nenhum silo disponível.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-6 pt-2 px-4 no-scrollbar flex gap-4 snap-x">
            {silos.map((silo) => (
              <SiloSelectorCard
                key={silo.id}
                silo={silo}
                isSelected={selectedSilo === silo.id}
                onSelect={() => setSelectedSilo(silo.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Input de Quantidade e Unidade */}
      <section className="mt-4 px-4 flex-1">
        <h2 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">2</span>
          Informe a Quantidade
        </h2>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-concrete-200">

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {(['concha', 'vagao', 'kg'] as UnitType[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold capitalize transition-all duration-200 focus:outline-none ${
                  unit === u
                    ? 'bg-white text-brand-900 shadow-sm ring-1 ring-black/5'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {u === 'vagao' ? 'vagão' : u}
              </button>
            ))}
          </div>

          <div className="relative py-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-center text-7xl font-bold text-brand-900 placeholder:text-concrete-200 outline-none bg-transparent"
              inputMode="decimal"
            />
            <div className="text-center mt-4 text-slate-500 font-medium flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-lg mx-auto max-w-[200px]">
              <Settings2 size={14} className="text-brand-500" />
              <span>≈ {estimatedKg.toLocaleString('pt-BR')} kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Botões de Ação Rápida */}
      <div className="p-4 grid grid-cols-2 gap-4 mt-auto bg-white border-t border-concrete-100 pb-safe">
        <button
          onClick={() => handleAction('descarte')}
          disabled={!amount || parseFloat(amount) <= 0}
          className="group flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-red-50 text-red-600 font-bold border-2 border-transparent active:scale-95 active:border-red-500 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          <Trash2 size={28} className="group-active:scale-110 transition-transform mb-1" />
          <span>Descarte</span>
        </button>

        <button
          onClick={() => handleAction('retirada')}
          disabled={!amount || parseFloat(amount) <= 0}
          className="group flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-brand-900 text-white font-bold shadow-lg shadow-brand-900/30 active:scale-95 active:shadow-none hover:bg-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          <ArrowDownCircle size={28} className="group-active:translate-y-1 transition-transform mb-1" />
          <span>Registrar Trato</span>
        </button>
      </div>
    </div>
  );
}
