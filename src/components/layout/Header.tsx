'use client';

import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react"; 
import { logout } from "@/app/login/actions"; // Importa a ação de logout que criamos antes
import { Button } from "@/components/ui/Button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-silo-brand text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Marca / Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 bg-silo-action rounded-sm flex items-center justify-center font-bold text-black">
              G
            </div>
            <span className="text-xl font-bold tracking-tight">GestSilo</span>
        </Link>

        {/* Ações do Header */}
        <div className="flex items-center gap-2">
          {/* Indicador de Perfil (Futuro) */}
          <div className="hidden md:flex items-center gap-2 mr-2 text-xs text-gray-400 border-r border-gray-700 pr-4">
            <User size={14} />
            <span>Gerência</span>
          </div>

          {/* Botão de Logout */}
          <form action={logout}>
            <Button 
              variant="ghost" 
              className="p-2 h-10 w-10 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
              title="Sair do Sistema"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </form>

          {/* Menu Mobile */}
          <button className="md:hidden p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-300">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
