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
        brand: {
          900: "#064E3B", // Pine Teal (Main Brand Color)
          700: "#044030", // Darker shade for hovers
          500: "#527329", // New Crop Green 
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
          success: "#527329",
          warning: "#976023",
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
