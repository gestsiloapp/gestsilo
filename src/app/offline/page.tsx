import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-2xl font-bold text-brand-900 mb-2">Você está offline</h1>
      <p className="text-slate-600 mb-6">Conecte-se à internet para continuar usando o GestSilo.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors"
      >
        Tentar novamente
      </Link>
    </div>
  );
}
