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
        
        // Cores migradas do gestsilo.iastudio
        brand: {
          900: "#064E3B", // Pine Teal (Main Brand Color)
          700: "#044030", // Darker shade for hovers
          500: "#527329", // New Crop Green (RGB 82,115,41)
          100: "#E6F0ED", // Very light tint
        },
        earth: {
          500: "#976023", // Golden Earth (Secondary Brand Color)
          400: "#B57B35", // Lighter for hovers
          100: "#FDF6EE", // Light tint for backgrounds
        },
        concrete: {
          500: "#64748B",
          100: "#F1F5F9",
        },
        ui: {
          bg: "#F8FAFC", 
          card: "#FFFFFF",
          text: "#0F172A", 
          muted: "#64748B", 
        },
        status: {
          success: "#527329", // Success now aligns with Brand 500
          warning: "#976023", // Warning aligns with Earth
          danger: "#DC2626",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'zoom-in': 'zoomIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};