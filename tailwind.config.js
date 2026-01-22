/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'silo-action': '#f59e0b', // Cor âmbar/laranja para ações (amber-500)
        'silo-border': '#e5e7eb', // Cor para bordas
        'silo-text': '#1f2937', // Cor para texto
        'silo-danger': '#dc2626', // Cor para ações perigosas (vermelho)
        'silo-success': '#16a34a', // Cor para ações de sucesso (verde)
        'silo-brand': '#1f2937', // Cor da marca/títulos principais
      },
    },
  },
  plugins: [],
};
