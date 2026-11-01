/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F6F7FB',
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F9FAFC',
          subtle: '#F1F4F9',
        },
        primary: {
          DEFAULT: '#5B5FEF',
          hover: '#4A4EDD',
          subtle: '#EEF0FF',
          dark: '#3A3DB8',
        },
        secondary: {
          DEFAULT: '#16A6A1',
          hover: '#128A86',
          subtle: '#E6F8F7',
        },
        border: {
          DEFAULT: '#E7EAF0',
          focus: '#CCD2DF',
        },
        text: {
          primary: '#172033',
          secondary: '#697386',
          muted: '#9AA4B2',
        },
        status: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          'success-text': '#065F46',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-text': '#92400E',
          error: '#EF4444',
          'error-bg': '#FEF2F2',
          'error-text': '#991B1B',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
          'info-text': '#1E40AF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
