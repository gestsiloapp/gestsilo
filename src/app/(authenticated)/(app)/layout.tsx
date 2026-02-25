'use client';

/**
 * Layout único para todas as rotas autenticadas do app.
 * Sidebar: Visão Geral, Dashboards, Histórico, Equipe, Ajustes.
 * Margem do conteúdo: 1,5cm.
 */
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, BarChart3, Wifi, WifiOff, Users, LogOut, Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Mock do estado de sincronização (Futuramente ligaremos ao RxDB)
const isOnline = true; 

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Verifica qual menu está ativo
  const isActive = (path: string) => {
    if (path === '/manager' && (pathname === '/manager' || pathname === '/')) return true;
    if (path === '/dashboards' && pathname === '/dashboards') return true;
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
  };

  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text pb-20 md:pb-0 md:pl-64">
      
      {/* --- CABEÇALHO (Mobile & Desktop) --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-concrete-100 z-50 flex items-center justify-between px-4 md:pl-64 transition-all duration-300">
        <div className="md:hidden font-bold text-brand-900 text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center text-white">
            <Sprout size={18} />
          </div>
          GestSilo
        </div>
        
        <div className="flex items-center ml-auto gap-3 md:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-concrete-100 rounded-full border border-slate-200 shadow-sm">
             {isOnline ? (
               <Wifi size={14} className="text-green-600" />
             ) : (
               <WifiOff size={14} className="text-orange-500" />
             )}
             <span className="text-xs font-medium text-slate-500 hidden sm:block">
               {isOnline ? "Sincronizado" : "Pendente"}
             </span>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Usuário</p>
              <p className="text-xs text-brand-900 font-medium">Conectado</p>
            </div>
            <button 
              onClick={handleLogout}
              className="h-10 w-10 bg-brand-900 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform focus:outline-none"
              title="Sair do Sistema"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MENU LATERAL (Desktop) --- */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-brand-900 text-white z-50 hidden md:flex flex-col shadow-2xl border-r border-white/5">
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-brand-900">
          <div className="w-8 h-8 bg-earth-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
             <Sprout size={20} className="text-white"/>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GestSilo</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-2">Gerenciamento</p>
          
          <button onClick={() => handleNavigation('/manager')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/manager') ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'}`}>
            <LayoutDashboard size={20} /> <span>Visão Geral</span>
          </button>
          
          <button onClick={() => handleNavigation('/dashboards')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/dashboards') ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'}`}>
            <BarChart3 size={20} /> <span>Dashboards</span>
          </button>
          
          <button onClick={() => handleNavigation('/history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/history') ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'}`}>
            <History size={20} /> <span>Histórico</span>
          </button>
          
          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-6">Administrativo</p>
          
          <button onClick={() => handleNavigation('/team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/team') ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'}`}>
            <Users size={20} /> <span>Equipe</span>
          </button>
          
          <button onClick={() => handleNavigation('/settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/settings') ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'}`}>
            <Settings size={20} /> <span>Ajustes</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 bg-brand-900/50">
          <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-brand-100 text-center font-medium">GestSilo Enterprise</p>
              <p className="text-[10px] text-earth-400 text-center mt-1">v3.2.0</p>
          </div>
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO (Margem 1,5cm das barras) --- */}
      <main className="pt-[calc(4rem+1.5cm)] pb-[1.5cm] pl-[1.5cm] pr-[1.5cm] w-full min-h-screen">
        {children}
      </main>

      {/* --- MENU INFERIOR (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-concrete-100 h-16 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => handleNavigation('/manager')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/manager') ? 'text-brand-900 border-t-2 border-brand-900' : 'text-slate-400 hover:text-brand-900'}`}>
          <LayoutDashboard size={20} /> <span className="text-[10px] mt-1 font-medium">Início</span>
        </button>
        
        <button onClick={() => handleNavigation('/dashboards')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/dashboards') ? 'text-brand-900 border-t-2 border-brand-900' : 'text-slate-400 hover:text-brand-900'}`}>
          <BarChart3 size={20} /> <span className="text-[10px] mt-1 font-medium">Dash</span>
        </button>
        
        <button onClick={() => handleNavigation('/history')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/history') ? 'text-brand-900 border-t-2 border-brand-900' : 'text-slate-400 hover:text-brand-900'}`}>
          <History size={20} /> <span className="text-[10px] mt-1 font-medium">Histórico</span>
        </button>
        
        <button onClick={() => handleNavigation('/settings')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/settings') ? 'text-brand-900 border-t-2 border-brand-900' : 'text-slate-400 hover:text-brand-900'}`}>
          <Settings size={20} /> <span className="text-[10px] mt-1 font-medium">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}