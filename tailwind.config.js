/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#60a5fa',
          hover: '#3b82f6',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#eef2f7',
        },
        border: '#e5e7eb',
        text: {
          DEFAULT: '#111827',
          muted: '#6b7280',
        },
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        'out-of-stock': '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        btn: '0.5rem',
      },
      keyframes: {
        'badge-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'badge-pop': 'badge-pop 0.35s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in forwards',
        'fade-out': 'fade-out 0.2s ease-in forwards',
      },
    },
  },
  plugins: [],
};
