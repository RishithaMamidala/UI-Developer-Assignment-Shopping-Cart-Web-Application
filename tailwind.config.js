/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',
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
    },
  },
  plugins: [],
};
