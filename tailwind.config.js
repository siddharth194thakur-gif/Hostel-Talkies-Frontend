/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary
          700: '#4338CA', // Dark Primary
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#7C3AED', // Secondary Purple
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F7F8FC',
          card: '#FFFFFF',
          subtle: '#F8FAFC',
          border: '#E2E8F0',
        },
        ink: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        'card-hover': '0 10px 25px -3px rgba(79, 70, 229, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
        'elevated': '0 20px 25px -5px rgba(16, 24, 40, 0.08), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
        'badge': '0 2px 4px rgba(79, 70, 229, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ambientFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        ambientFloatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1.5deg)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.06)' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.28)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.22)' },
          '70%': { transform: 'scale(1)' },
        },
        shimmerWave: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blobMorph: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.12)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.92)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ambient-float': 'ambientFloat 5s ease-in-out infinite',
        'ambient-float-reverse': 'ambientFloatReverse 6s ease-in-out infinite',
        'gradient-flow': 'gradientFlow 8s ease infinite',
        'glow-pulse': 'glowPulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartBeat 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmerWave 2s infinite',
        'blob': 'blobMorph 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
