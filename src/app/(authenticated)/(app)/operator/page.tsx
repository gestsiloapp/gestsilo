'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SiloSelector, SiloOption } from '@/components/domain/SiloSelector';
import { Settings2, ArrowDownCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDatabase } from '@/lib/database/db';
import { SiloDocType } from '@/lib/database/schema';
import { v4 as uuidv4 } from 'uuid';

// Fatores de conversão (Futuramente serão puxados da coleção farm_settings do RxDB)
const CONVERSION_RATES = {
  concha: 450, // 1 concha = 450kg
  vagao: 2500, // 1 vagão = 2500kg
  kg: 1
};

type UnitType = 'concha' | 'vagao' | 'kg';

export default function OperatorDashboard() {
  const router = useRouter();

  // Estado para armazenar os silos reais vindos do RxDB
  const [dbSilos, setDbSilos] = useState<SiloDocType[]>([]);
  const [selectedSilo, setSelectedSilo] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<UnitType>('concha');

  // Inicialização do Banco Local e carregamento dos Silos
  useEffect(() => {
    const loadSilos = async () => {
      try {
        const db = await getDatabase();
        if (!db) return;

        const silos = await db.silos.find().exec();
        setDbSilos(silos.map(s => s.toJSON()));

        if (silos.length > 0 && !selectedSilo) {
          setSelectedSilo(silos[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar silos do RxDB:", error);
      }
    };
    loadSilos();
  }, [selectedSilo]);

  // Transforma os documentos do RxDB para o formato visual SiloOption
  const silos: SiloOption[] = useMemo(() => dbSilos.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type ?? '',
    // TODO: Criar hook otimizado para não violar regras do React em loops
    stockLevel: 50 // Placeholder visual para a barra de estoque
  })), [dbSilos]);

  // Cálculo em tempo real para Kg
  const estimatedKg = amount ? (parseFloat(amount) * CONVERSION_RATES[unit]) : 0;

  const handleAction = async (type: 'retirada' | 'descarte') => {
    if (!amount || parseFloat(amount) <= 0 || !selectedSilo) return;

    // Regra de Ouro: Conversão mandatória para KG antes de persistir
    const amountKg = parseFloat(amount) * CONVERSION_RATES[unit];

    try {
      const db = await getDatabase();
      if (!db) throw new Error("Banco de dados local indisponível.");

      // Regra de Ouro: Idempotência e Lógica Append-Only
      const eventPayload = {
        client_event_id: uuidv4(),
        silo_id: selectedSilo,
        user_id: 'local_operator_id', // Futuramente injetado pelo AuthContext
        event_type: type === 'retirada' ? 'USAGE' : 'COMPENSATION',
        amount_kg: -Math.abs(amountKg), // Negativo: saída (retirada/descarte) reduz estoque
        input_method: unit === 'kg' ? 'MANUAL_KG' : (unit === 'concha' ? 'BUCKET_COUNT' : 'WAGON_COUNT'),
        sync_status: 'PENDING' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.events.insert(eventPayload);

      // Simulação de Feedback Tátil e Visual para uso no campo
      if (navigator.vibrate) navigator.vibrate(50);
      alert(`✅ Registrado offline com sucesso!\n${amount} ${unit}(s) convertidos para ${amountKg} kg.`);

      setAmount(''); // Limpa o formulário
    } catch (error) {
      console.error("❌ Conflito ou Erro no RxDB:", error);
      alert("Falha ao registrar operação localmente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe animate-fade-in -mt-4">

      {/* 1. Header Compacto Mobile */}
      <header className="px-4 pt-4 pb-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/manager')} className="p-2 -ml-2 text-ui-muted hover:text-ui-text active:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-900 leading-none">Operação Diária</h1>
            <p className="text-xs text-ui-muted mt-1">Fazenda Santa Fé • Offline Mode</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-[10px] font-bold text-status-success">RXDB ATIVO</span>
        </div>
      </header>

      {/* 2. Seleção de Silo */}
      <section className="mt-6">
        <h2 className="px-4 text-sm font-bold text-ui-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">1</span>
          Selecione a Origem
        </h2>
        {silos.length > 0 ? (
          <SiloSelector
            silos={silos}
            selectedId={selectedSilo}
            onSelect={setSelectedSilo}
          />
        ) : (
          <p className="px-4 text-sm text-ui-muted">Carregando silos do armazenamento local...</p>
        )}
      </section>

      {/* 3. Input de Quantidade e Unidade */}
      <section className="mt-8 px-4 flex-1">
        <h2 className="text-sm font-bold text-ui-muted mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">2</span>
          Informe a Quantidade
        </h2>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">

          {/* Tabs de Unidade */}
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

      {/* 4. Botões de Ação Rápida */}
      <div className="p-4 grid grid-cols-2 gap-4 mt-auto bg-white border-t border-slate-100 pb-safe">
        <button
          onClick={() => handleAction('descarte')}
          className="group flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-red-50 text-status-danger font-bold border-2 border-transparent active:scale-95 active:border-status-danger hover:bg-red-100 transition-all"
        >
          <Trash2 size={28} className="group-active:scale-110 transition-transform mb-1" />
          <span>Descarte</span>
        </button>

        <button
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
