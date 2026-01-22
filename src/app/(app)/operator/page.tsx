'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Truck, PackageMinus, AlertTriangle } from 'lucide-react';

export default function OperatorDashboard() {
  // Mock para visualização inicial (depois ligaremos ao banco real)
  const [mode, setMode] = useState<'IDLE' | 'LOADING' | 'USAGE'>('IDLE');

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 text-white">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        
        {/* Cabeçalho de Boas Vindas */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Operação Diária</h1>
          <p className="text-gray-400">Selecione uma ação para registrar</p>
        </div>

        {/* 1. Modo de Seleção (Cards Grandes Premium) */}
        {mode === 'IDLE' && (
          <div className="grid grid-cols-1 gap-4">
            
            {/* Botão de Retirada (Trato) */}
            <button 
                onClick={() => setMode('USAGE')}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-left hover:border-silo-action transition-all active:scale-95"
            >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <PackageMinus size={120} />
                </div>
                <div className="relative z-10">
                    <div className="h-12 w-12 rounded-full bg-silo-danger/20 text-silo-danger flex items-center justify-center mb-4">
                        <PackageMinus size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Saída (Trato)</h2>
                    <p className="text-zinc-400 mt-1">Registrar alimentação do gado</p>
                </div>
            </button>

            {/* Botão de Chegada (Carga) */}
            <button 
                onClick={() => setMode('LOADING')}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-left hover:border-silo-success transition-all active:scale-95"
            >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Truck size={120} />
                </div>
                <div className="relative z-10">
                    <div className="h-12 w-12 rounded-full bg-silo-success/20 text-silo-success flex items-center justify-center mb-4">
                        <Truck size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Entrada (Carga)</h2>
                    <p className="text-zinc-400 mt-1">Registrar chegada de caminhão</p>
                </div>
            </button>

             {/* Botão de Ocorrência (Alerta) */}
             <button className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-transparent p-4 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                <AlertTriangle size={18} />
                <span>Reportar Problema</span>
            </button>
          </div>
        )}

        {/* 2. Formulário Simplificado (Aparece ao clicar) */}
        {mode !== 'IDLE' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">
                        {mode === 'USAGE' ? 'Registrar Saída' : 'Registrar Entrada'}
                    </h2>
                    <Button variant="ghost" onClick={() => setMode('IDLE')} className="text-zinc-400">
                        Cancelar
                    </Button>
                </div>

                {/* Input Gigante para Facilidade de Uso */}
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Quantidade (kg)</label>
                        <input 
                            type="number" 
                            autoFocus
                            className="w-full bg-black border border-zinc-700 rounded-xl text-4xl font-bold text-white p-4 text-center focus:ring-2 focus:ring-silo-action outline-none"
                            placeholder="000"
                        />
                    </div>

                    <Button className="w-full h-14 text-lg font-bold bg-silo-action hover:bg-amber-600 text-black">
                        Confirmar
                    </Button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
