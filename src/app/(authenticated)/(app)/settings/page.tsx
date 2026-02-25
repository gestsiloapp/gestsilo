'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tractor, Package, Users, Scale, MapPin, FileText, ChevronRight, 
  ArrowLeft, Save, Wrench, AlertCircle, ShieldCheck, LogOut 
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeView, setActiveView] = useState<'main' | 'machinery' | 'conversion'>('main');
  
  // --- ESTADO: FATORES DE CONVERSÃO ---
  const [conversionFactors, setConversionFactors] = useState({
    concha: 450,
    vagao: 2500
  });

  // --- MOCK: MAQUINÁRIO ---
  const machineryList = [
    { id: 1, name: "John Deere 7230J", type: "Trator", status: "active", hourMeter: "4.230h" },
    { id: 2, name: "Massey Ferguson 4292", type: "Trator", status: "maintenance", hourMeter: "8.100h" },
    { id: 3, name: "Vagão Casale 5.0", type: "Implemento", status: "active", hourMeter: "-" },
    { id: 4, name: "New Holland TC59", type: "Colhedora", status: "active", hourMeter: "2.100h" }
  ];

  // --- RENDERIZAÇÃO: MENU PRINCIPAL ---
  if (activeView === 'main') {
    return (
      <div className="space-y-6 animate-fade-in pb-10 mt-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Ajustes do Sistema</h1>
          <p className="text-slate-500 mt-1">Configure parâmetros operacionais e permissões da fazenda.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-concrete-100 overflow-hidden">
          {/* Categoria: Operacional */}
          <div className="p-4 bg-slate-50 border-b border-concrete-100">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operacional</h2>
          </div>
          <div className="divide-y divide-concrete-100">
            <button 
              onClick={() => setActiveView('conversion')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-earth-100 text-earth-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scale size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-brand-900">Fatores de Conversão</h3>
                  <p className="text-sm text-slate-500">Ajuste de peso para Conchas e Vagões</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-900 transition-colors" />
            </button>

            <button 
              onClick={() => setActiveView('machinery')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-concrete-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tractor size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-brand-900">Maquinário e Frotas</h3>
                  <p className="text-sm text-slate-500">Gerencie ativos e horímetros</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-900 transition-colors" />
            </button>
          </div>

          {/* Categoria: Administrativo */}
          <div className="p-4 bg-slate-50 border-y border-concrete-100">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrativo</h2>
          </div>
          <div className="divide-y divide-concrete-100">
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-brand-900">Dados da Propriedade</h3>
                  <p className="text-sm text-slate-500">Endereço, CNPJ e informações legais</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-900 transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-concrete-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-brand-900">Permissões de Acesso</h3>
                  <p className="text-sm text-slate-500">Controle o que os operadores podem ver</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-900 transition-colors" />
            </button>
          </div>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
          }}
          className="w-full flex items-center justify-center gap-2 p-4 mt-6 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-bold text-sm"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: FATORES DE CONVERSÃO ---
  if (activeView === 'conversion') {
    return (
      <div className="space-y-6 animate-fade-in pb-10 mt-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setActiveView('main')}
            className="p-2 bg-white border border-concrete-100 rounded-lg hover:bg-slate-50 transition-colors text-brand-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-900">Fatores de Conversão</h1>
            <p className="text-sm text-slate-500">Configure os pesos padrão para o Modo Operador.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-concrete-100 overflow-hidden p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Peso de 1 Concha (Pá Carregadeira)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={conversionFactors.concha}
                  onChange={e => setConversionFactors({...conversionFactors, concha: Number(e.target.value)})}
                  className="w-full p-4 rounded-xl border-2 border-concrete-100 bg-slate-50 font-bold text-xl text-brand-900 focus:outline-none focus:border-earth-400 focus:bg-white transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KG</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Peso de 1 Vagão (Misturador)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={conversionFactors.vagao}
                  onChange={e => setConversionFactors({...conversionFactors, vagao: Number(e.target.value)})}
                  className="w-full p-4 rounded-xl border-2 border-concrete-100 bg-slate-50 font-bold text-xl text-brand-900 focus:outline-none focus:border-earth-400 focus:bg-white transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KG</span>
              </div>
            </div>

            <div className="bg-earth-50 border border-earth-200 p-4 rounded-xl flex gap-3 items-start mt-6">
               <AlertCircle size={20} className="text-earth-600 shrink-0" />
               <p className="text-sm text-earth-700 font-medium leading-relaxed">
                 Alterar estes valores atualizará imediatamente o multiplicador no celular dos operadores no campo.
               </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
            <button 
              onClick={() => setActiveView('main')}
              className="w-full sm:w-auto px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                alert("Configurações salvas com sucesso! (Futuramente integrado ao banco)");
                setActiveView('main');
              }}
              className="w-full sm:flex-1 bg-brand-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Ajustes Globais
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: MAQUINÁRIO (MOCK VISUAL) ---
  if (activeView === 'machinery') {
    return (
      <div className="space-y-6 animate-fade-in pb-10 mt-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveView('main')} className="p-2 bg-white border border-concrete-100 rounded-lg hover:bg-slate-50 transition-colors text-brand-900">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-brand-900">Maquinário</h1>
                    <p className="text-sm text-slate-500">Frota ativa da fazenda</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {machineryList.map(machine => (
                <div key={machine.id} className="bg-white p-5 rounded-2xl border border-concrete-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-brand-300 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${machine.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {machine.status === 'active' ? <Tractor size={24} /> : <Wrench size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-900 text-lg">{machine.name}</h3>
                            <p className="text-sm text-slate-500">{machine.type}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 sm:text-right">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Horímetro</p>
                            <p className="font-bold text-brand-900">{machine.hourMeter}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${machine.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {machine.status === 'active' ? 'Operacional' : 'Manutenção'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
}
