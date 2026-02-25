'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, Settings, BarChart3, Wifi, WifiOff } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
        active 
        ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold' 
        : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
        active 
        ? 'text-brand-900' 
        : 'text-concrete-500 hover:text-brand-900'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('painel');
  const [isOnline, setIsOnline] = useState(true);

  // Monitora o status da rede para o Offline-First
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincroniza a aba ativa com a URL atual do Next.js
  useEffect(() => {
    if (pathname.includes('/dashboards')) setActiveTab('dash');
    else if (pathname.includes('/history')) setActiveTab('historico');
    else if (pathname.includes('/settings')) setActiveTab('ajustes');
    else setActiveTab('painel');
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text pb-20 md:pb-0 md:pl-64">
      
      {/* Cabeçalho (Header) Fixo */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-concrete-100 z-50 flex items-center justify-between px-4 md:pl-64 transition-all duration-300">
        <div className="md:hidden font-bold text-brand-900 text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          GestSilo
        </div>
        
        <div className="flex items-center ml-auto gap-3 md:gap-4">
           {/* Indicador de Sincronização (Offline-First UX) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-concrete-100 rounded-full border border-slate-200 shadow-sm">
             {isOnline ? (
               <Wifi size={14} className="text-status-success" />
             ) : (
               <WifiOff size={14} className="text-status-warning" />
             )}
             <span className="text-xs font-medium text-ui-muted hidden sm:block">
               {isOnline ? "Online" : "Offline (Local)"}
             </span>
          </div>

          {/* Indicador de Perfil Atual */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-ui-text">Operador</p>
              <p className="text-xs text-brand-900 font-medium">Sessão Local</p>
            </div>
            <div 
              onClick={() => router.push('/login')}
              className="h-10 w-10 bg-brand-900 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Acessar Tela de Login"
            >
              U
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Desktop (Persistente) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-brand-900 text-white z-50 hidden md:flex flex-col shadow-2xl border-r border-white/5">
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-brand-900">
          <div className="w-8 h-8 bg-earth-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
             <LayoutDashboard size={20} className="text-white"/>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GestSilo</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-2">Gerenciamento</p>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Visão Geral" 
            active={activeTab === 'painel'} 
            onClick={() => router.push('/manager')}
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Dashboards" 
            active={activeTab === 'dash'} 
            onClick={() => router.push('/dashboards')}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Histórico" 
            active={activeTab === 'historico'} 
            onClick={() => router.push('/history')}
          />
          
          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-6">Administrativo</p>
          <NavItem 
            icon={<Settings size={20} />} 
            label="Ajustes" 
            active={activeTab === 'ajustes'} 
            onClick={() => router.push('/settings')}
          />
        </nav>

        <div className="p-4 border-t border-white/10 bg-brand-900/50">
          <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-brand-100 text-center font-medium">Offline-First Engine</p>
              <p className="text-[10px] text-earth-400 text-center mt-1">RxDB Ativo</p>
          </div>
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO (Onde as páginas aparecem) --- */}
      <main className="pt-20 px-6 sm:px-10 lg:px-12 w-full min-h-[calc(100vh-5rem)]">
        {children}
      </main>

      {/* Barra de Navegação Inferior (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-concrete-100 h-16 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Início" 
          active={activeTab === 'painel'} 
          onClick={() => router.push('/manager')}
        />
        <MobileNavItem 
          icon={<BarChart3 size={20} />} 
          label="Dash" 
          active={activeTab === 'dash'} 
          onClick={() => router.push('/dashboards')}
        />
        <MobileNavItem 
          icon={<History size={20} />} 
          label="Hist" 
          active={activeTab === 'historico'} 
          onClick={() => router.push('/history')}
        />
        <MobileNavItem 
          icon={<Settings size={20} />} 
          label="Ajustes" 
          active={activeTab === 'ajustes'} 
          onClick={() => router.push('/settings')}
        />
      </nav>
    </div>
  );
};
