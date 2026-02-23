'use client';

import React, { useState } from 'react';
import {
  Tractor,
  Package,
  Users,
  Scale,
  MapPin,
  FileText,
  LogOut,
  ChevronRight,
  Database,
  Wifi,
  ArrowLeft,
  Save,
  CheckCircle2,
  Wrench,
  AlertCircle
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Importa o cliente Supabase

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient(); // Inicializa o cliente Supabase
  const [activeView, setActiveView] = useState<'main' | 'machinery' | 'conversion'>('main');

  // --- ESTADO: FATORES DE CONVERSÃO (MOCK) ---
  const [conversionFactors, setConversionFactors] = useState({
    concha: 450,
    vagao: 2500
  });

  // --- MOCK: MAQUINÁRIO ---
  const machineryList = [
    { id: 1, name: "John Deere 7230J", type: "Trator", status: "active", hourMeter: "4.230h" },
    { id: 2, name: "Massey Ferguson 4292", type: "Trator", status: "maintenance", hourMeter: "8.100h" },
    { id: 3, name: "Vagão Casale 5.0", type: "Implemento", status: "active", hourMeter: "-" },
    { id: 4, name: "New Holland TC59", type: "Colhedora", status: "active", hourMeter: "2.150h" },
  ];

  // Configuração do Menu Principal
  const menuItems = [
    {
      title: "Cadastros Operacionais",
      items: [
        {
          icon: <Tractor size={20} />,
          label: "Maquinário & Frotas",
          desc: "Tratores, colhedoras e implementos",
          count: `${machineryList.length} ativos`,
          action: () => setActiveView('machinery')
        },
        {
          icon: <Package size={20} />,
          label: "Estoque de Insumos",
          desc: "Sementes, defensivos e fertilizantes",
          count: "8 baixos",
          action: () => { /* Implementar navegação/funcionalidade */ }
        },
        {
          icon: <Users size={20} />,
          label: "Equipe & Acessos",
          desc: "Gerenciar operadores e senhas",
          count: "5 usuários",
          action: () => { /* Implementar navegação/funcionalidade */ }
        },
      ]
    },
    {
      title: "Parâmetros da Fazenda",
      items: [
        {
          icon: <Scale size={20} />,
          label: "Fatores de Conversão",
          desc: "Peso da concha (kg) e densidades",
          alert: true,
          action: () => setActiveView('conversion')
        },
        {
          icon: <MapPin size={20} />,
          label: "Dados da Propriedade",
          desc: "Endereço e inscrição estadual",
          count: "",
          action: () => { /* Implementar navegação/funcionalidade */ }
        },
      ]
    },
    {
      title: "Sistema e Dados",
      items: [
        {
          icon: <Wifi size={20} />,
          label: "Sincronização",
          desc: "Gerenciar dados offline",
          count: "Online", // Conectar ao status real do RxDB/sync
          action: () => { /* Implementar navegação/funcionalidade */ }
        },
        {
          icon: <Database size={20} />,
          label: "Backup & Exportação",
          desc: "Baixar dados em CSV/PDF",
          count: "",
          action: () => { /* Implementar navegação/funcionalidade */ }
        },
      ]
    }
  ];

  // Função para Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // --- SUB-TELA: LISTA DE MAQUINÁRIO ---
  if (activeView === 'machinery') {
    return (
      <div className="min-h-screen bg-ui-bg animate-fade-in pb-safe">
        <header className="bg-white border-b border-concrete-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setActiveView('main')} className="p-2 -ml-2 text-ui-muted hover:text-brand-900 rounded-full hover:bg-slate-50 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-brand-900">Maquinário & Frotas</h1>
            <p className="text-xs text-ui-muted">Gerenciamento de ativos</p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {machineryList.map(machine => (
            <div key={machine.id} className="bg-white p-4 rounded-2xl border border-concrete-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${machine.status === 'active' ? 'bg-brand-100 text-brand-900' : 'bg-earth-100 text-earth-500'}`}>
                  {machine.status === 'active' ? <Tractor size={24} /> : <Wrench size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-brand-900">{machine.name}</h3>
                  <p className="text-xs text-ui-muted">{machine.type} • {machine.hourMeter}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${machine.status === 'active' ? 'bg-concrete-100 text-brand-900' : 'bg-earth-100 text-earth-500'}`}>
                {machine.status === 'active' ? 'Operante' : 'Manutenção'}
              </div>
            </div>
          ))}

          <button className="w-full py-4 border-2 border-dashed border-concrete-100 rounded-2xl text-ui-muted font-bold text-sm hover:border-brand-900 hover:text-brand-900 transition-colors flex items-center justify-center gap-2">
            + Adicionar Novo Ativo
          </button>
        </div>
      </div>
    );
  }

  // --- SUB-TELA: FATORES DE CONVERSÃO ---
  if (activeView === 'conversion') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-zoom-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-earth-500">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-900">Fatores de Conversão</h3>
              <p className="text-xs text-ui-muted">Valores referência para cálculo de estoque</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase">Peso da Concha (Trator Padrão)</label>
              <div className="relative">
                <input
                  type="number"
                  value={conversionFactors.concha}
                  onChange={(e) => setConversionFactors({ ...conversionFactors, concha: Number(e.target.value) })}
                  className="w-full p-4 rounded-xl bg-concrete-100 text-brand-900 font-bold text-lg border-2 border-transparent focus:bg-white focus:border-earth-400 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ui-muted">KG</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase">Capacidade do Vagão</label>
              <div className="relative">
                <input
                  type="number"
                  value={conversionFactors.vagao}
                  onChange={(e) => setConversionFactors({ ...conversionFactors, vagao: Number(e.target.value) })}
                  className="w-full p-4 rounded-xl bg-concrete-100 text-brand-900 font-bold text-lg border-2 border-transparent focus:bg-white focus:border-earth-400 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ui-muted">KG</span>
              </div>
            </div>

            <div className="bg-earth-100 p-3 rounded-lg flex gap-2 items-start">
              <AlertCircle size={16} className="text-earth-500 mt-0.5 shrink-0" />
              <p className="text-xs text-earth-500 font-medium leading-relaxed">
                Alterar estes valores afetará o cálculo de estimativa de retirada no painel do operador imediatamente.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setActiveView('main')}
              className="flex-1 py-3 font-bold text-ui-muted hover:bg-concrete-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setActiveView('main');
                // Implementar lógica de salvamento no backend/contexto
              }}
              className="flex-[2] bg-brand-900 text-white font-bold py-3 rounded-xl hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Ajustes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW PRINCIPAL ---
  return (
    <div className="min-h-screen bg-ui-bg pb-24 animate-fade-in relative">

      {/* Header */}
      <header className="bg-white border-b border-concrete-100 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Ajustes</h1>
        <p className="text-sm text-ui-muted">Gerencie os recursos da Fazenda Santa Fé.</p>
      </header>

      <main className="p-4 space-y-8">

        {menuItems.map((section, idx) => (
          <section key={idx}>
            <h2 className="px-2 text-xs font-bold text-ui-muted uppercase tracking-wider mb-3">
              {section.title}
            </h2>

            <div className="bg-white rounded-2xl border border-concrete-100 shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <div key={item.label}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left group"
                  >

                    {/* Ícone */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${item.alert
                        ? 'bg-earth-100 text-earth-500'
                        : 'bg-brand-100 text-brand-900 group-hover:bg-brand-900 group-hover:text-white'}
                    `}>
                      {item.icon}
                    </div>

                    {/* Texto */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-ui-text">{item.label}</h3>
                        {item.count && (
                          <span className="text-[10px] font-bold bg-concrete-100 text-ui-muted px-2 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ui-muted mt-0.5 truncate pr-4">
                        {item.desc}
                      </p>
                    </div>

                    {/* Seta */}
                    <ChevronRight size={18} className="text-concrete-500 group-hover:text-brand-900" />
                  </button>

                  {/* Divisor (exceto no último item) */}
                  {itemIdx < section.items.length - 1 && (
                    <hr className="border-concrete-100 ml-16" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Botão de Logout */}
        <button
            onClick={handleLogout} // Usa a nova função handleLogout
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-100 text-status-danger bg-red-50 hover:bg-red-100 transition-colors font-bold text-sm"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>

        <div className="text-center text-xs text-concrete-500 pt-4">
          Versão 2.5.0 (Build 240) • ID: 8821
        </div>
      </main>

    </div>
  );
}
