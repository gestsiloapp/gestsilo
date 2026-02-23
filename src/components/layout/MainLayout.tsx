'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, History, Settings, BarChart3, Wifi, WifiOff, LogOut, Users } from 'lucide-react';

// --- Subcomponentes (Botões do Menu) ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      isActive
        ? 'bg-white/10 text-earth-400 border-l-4 border-earth-500 font-bold'
        : 'text-brand-100 hover:bg-white/5 hover:text-white font-medium'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
      isActive
        ? 'text-brand-900'
        : 'text-concrete-500 hover:text-brand-900'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">${label}</span>
  </button>
);

// --- Layout Principal ---

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Estado de sincronização (conectar ao RxDB depois)
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { label: 'Visão Geral', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Dashboards', icon: <BarChart3 size={20} />, path: '/dashboards' },
    { label: 'Histórico', icon: <History size={20} />, path: '/history' },
    { label: 'Ajustes', icon: <Settings size={20} />, path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && (pathname === '/manager' || pathname === '/operator')) return true;
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-ui-bg font-sans text-ui-text pb-20 md:pb-0 md:pl-64">
      {/* --- Cabeçalho (Header) Fixo --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-concrete-100 z-50 flex items-center justify-between px-4 md:pl-64 transition-all duration-300 shadow-sm">
        {/* Logo Mobile */}
        <div className="md:hidden font-bold text-brand-900 text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          GestSilo
        </div>

        <div className="flex items-center ml-auto gap-3 md:gap-4">
          {/* Indicador de Sincronização */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-concrete-100 rounded-full border border-slate-200 shadow-sm">
            {isOnline ? (
              <Wifi size={14} className="text-status-success" />
            ) : (
              <WifiOff size={14} className="text-status-warning" />
            )}
            <span className="text-xs font-medium text-ui-muted hidden sm:block">
              {isOnline ? 'Sincronizado' : 'Pendente'}
            </span>
          </div>

          {/* Indicador de Perfil Atual & Logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-ui-text">Usuário</p>
              <p className="text-xs text-brand-900 font-medium">Conectado</p>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 w-10 bg-brand-100 hover:bg-red-100 text-brand-900 hover:text-red-600 rounded-full flex items-center justify-center transition-colors shadow-sm"
              title="Sair do Sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* --- Sidebar Desktop (Persistente) --- */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-brand-900 text-white z-50 hidden md:flex flex-col shadow-2xl border-r border-white/5">
        {/* Logo Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-brand-900">
          <div className="w-8 h-8 bg-earth-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GestSilo</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-2">
            Gerenciamento
          </p>

          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
              onClick={() => router.push(item.path === '/' ? '/manager' : item.path)}
            />
          ))}

          <p className="px-4 text-[10px] uppercase tracking-widest text-earth-400 font-bold mb-2 mt-6">
            Administrativo
          </p>
          <NavItem
            icon={<Users size={20} />}
            label="Equipe"
            isActive={pathname === '/team'}
            onClick={() => router.push('/team')}
          />
        </nav>

        <div className="p-4 border-t border-white/10 bg-brand-900/50">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-brand-100 text-center font-medium">Plano Enterprise</p>
            <p className="text-[10px] text-earth-400 text-center mt-1">v2.5.0</p>
          </div>
        </div>
      </aside>

      {/* --- Área de Conteúdo Principal --- */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-5rem)] animate-fade-in">
        {children}
      </main>

      {/* --- Barra de Navegação Inferior (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-concrete-100 h-16 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <MobileNavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.path)}
            onClick={() => router.push(item.path === '/' ? '/manager' : item.path)}
          />
        ))}
      </nav>
    </div>
  );
}
