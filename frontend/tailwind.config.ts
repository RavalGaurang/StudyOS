import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Primary Vibrant Purple
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        electric: {
          purple: '#A855F7',
          magenta: '#C026D3',
          blue: '#2563EB',
          indigo: '#4F46E5',
          cyan: '#06B6D4',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #2563EB 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #6D28D9 0%, #4338CA 50%, #1D4ED8 100%)',
      },
      boxShadow: {
        'brand-glow': '0 10px 25px -5px rgba(124, 58, 237, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
