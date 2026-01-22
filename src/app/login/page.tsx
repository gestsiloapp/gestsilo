'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { Button } from '@/components/ui/Button';
import { Wheat } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4">
      {/* Container Central */}
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-2xl border-t-4 border-silo-action relative overflow-hidden">
        
        {/* Cabeçalho da Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-silo-action text-white mb-2">
            <Wheat size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GestSilo
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Gestão Agrícola Integrada
          </p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-silo-action shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-silo-action shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Formulário de Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="login-email" 
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  E-mail Corporativo
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-silo-action focus:border-transparent transition-all outline-none disabled:opacity-50"
                  placeholder="ex: gerente@fazenda.com"
                />
              </div>

              <div>
                <label 
                  htmlFor="login-password" 
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Senha de Acesso
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-silo-action focus:border-transparent transition-all outline-none disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-600 font-medium text-center">
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? 'Autenticando...' : 'Acessar Painel'}
            </Button>
          </form>
        )}

        {/* Formulário de Cadastro */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="signup-fullName" 
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  id="signup-fullName"
                  name="fullName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-silo-action focus:border-transparent transition-all outline-none disabled:opacity-50"
                  placeholder="Seu Nome"
                />
              </div>

              <div>
                <label 
                  htmlFor="signup-email" 
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  E-mail
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-silo-action focus:border-transparent transition-all outline-none disabled:opacity-50"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label 
                  htmlFor="signup-password" 
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Senha
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-silo-action focus:border-transparent transition-all outline-none disabled:opacity-50"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-600 font-medium text-center">
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? 'Criando...' : 'Cadastrar e Entrar'}
            </Button>
          </form>
        )}

        {/* Rodapé Discreto */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Versão MVP 1.0 • Modo Offline-First
        </p>
      </div>
    </div>
  );
}
