/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand & primary
        primary: {
          DEFAULT: '#3A5BC7',
          dark: '#2A4FBD',
          soft: '#E8EEF9',
          50: '#F0F4FC',
          100: '#E8EEF9',
          500: '#3A5BC7',
          600: '#2A4FBD',
          700: '#1B41AE',
        },
        // Semantic
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#0EA5E9',
        // Surface
        bg: '#F5F7FB',
        surface: '#FFFFFF',
        // Text
        ink: {
          DEFAULT: '#1A1F36',
          muted: '#6B7280',
        },
        // Border
        line: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      spacing: {
        'gutter': '24px',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'card': '0.5rem',
        'modal': '0.75rem',
      },
      boxShadow: {
        card: '0px 1px 3px rgba(0,0,0,0.04), 0px 1px 2px rgba(0,0,0,0.03)',
        elevated: '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.04)',
        modal: '0px 10px 15px -3px rgba(0,0,0,0.10), 0px 4px 6px -4px rgba(0,0,0,0.06)',
      },
      maxWidth: {
        'container-max': '1440px',
      },
    },
  },
  plugins: [],
};
