'use client';

import React, { useState } from "react";
// Importamos os ícones (Adicionei o Loader2 para o botão girar e o AlertCircle para erros)
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, Tractor, Loader2, AlertCircle } from "lucide-react";
// Importamos a sua lógica de negócio que já funciona
import { login } from "./actions"; 
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  
  // Estados Visuais (do AI Studio)
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de Negócio (Para conectar ao Supabase)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN: Usando sua Server Action Segura ---
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const result = await login(formData);

        if (result?.error) {
            throw new Error(result.error);
        }
        // Se der certo, a action do Next.js redireciona automaticamente
      } else {
        // --- CADASTRO: Criando usuário no Supabase ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'MANAGER', // Role padrão
            },
          },
        });
        
        if (error) throw error;

        alert("Cadastro realizado! Faça login para continuar.");
        setIsLogin(true); // Volta para a tela de login
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Erro ao tentar acessar. Verifique seus dados.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 relative overflow-hidden px-4">
      
      {/* Background Animado do AI Studio */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-earth-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-zoom-in">
        
        {/* Logo */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-100 text-brand-900 mb-6 shadow-lg transform -translate-y-12 border-4 border-brand-900 ring-4 ring-white">
          <Sprout size={40} strokeWidth={2.5} />
        </div>

        <div className="mt-[-2.5rem] mb-6 text-center">
            <h2 className="text-2xl font-bold text-brand-900">
              {isLogin ? "Bem-vindo de volta" : "Junte-se ao GestSilo"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Gestão inteligente para sua propriedade.
            </p>
        </div>

        {/* Mensagem de Erro (Lógica Injetada) */}
        {errorMsg && (
            <div className="mb-4 w-full bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          
          {/* Campo de Nome (Aparece apenas no Cadastro) */}
          {!isLogin && (
            <div className="relative group">
                <div className="absolute left-4 top-3.5 text-concrete-500 group-focus-within:text-brand-900 transition-colors">
                    <Tractor size={20} />
                </div>
                <input
                    placeholder="Seu nome completo"
                    type="text"
                    required
                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-concrete-100 border-2 border-transparent focus:bg-white focus:border-earth-400 focus:ring-0 outline-none text-brand-900 placeholder-concrete-500 transition-all font-medium"
                    value={name}
                    onChange={(e) => setName((e.target as unknown as { value: string }).value)}
                />
            </div>
          )}

          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-concrete-500 group-focus-within:text-brand-900 transition-colors">
                <Mail size={20} />
            </div>
            <input
              name="email"
              placeholder="Seu e-mail corporativo"
              type="email"
              required
              className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-concrete-100 border-2 border-transparent focus:bg-white focus:border-earth-400 focus:ring-0 outline-none text-brand-900 placeholder-concrete-500 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail((e.target as unknown as { value: string }).value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-concrete-500 group-focus-within:text-brand-900 transition-colors">
                <Lock size={20} />
            </div>
            <input
              name="password"
              placeholder={isLogin ? "Sua senha" : "Crie uma senha forte"}
              type={showPassword ? "text" : "password"}
              required
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-concrete-100 border-2 border-transparent focus:bg-white focus:border-earth-400 focus:ring-0 outline-none text-brand-900 placeholder-concrete-500 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword((e.target as unknown as { value: string }).value)}
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-concrete-500 hover:text-brand-900 focus:outline-none"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-earth-500 hover:bg-earth-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold px-5 py-4 rounded-xl shadow-lg shadow-earth-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Processando...
                </>
            ) : (
                <>
                    {isLogin ? "Acessar Sistema" : "Criar Conta"}
                    <ArrowRight size={18} />
                </>
            )}
          </button>
        </form>
      </div>

      <div className="relative z-10 mt-8 text-center">
        <button 
            type="button"
            onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(""); // Limpa os erros ao trocar de aba
            }}
            className="text-white font-bold text-lg hover:underline mt-1 focus:outline-none"
        >
        {isLogin ? "Criar conta grátis" : "Fazer Login"}
        </button>
      </div>
    </div>
  );
}