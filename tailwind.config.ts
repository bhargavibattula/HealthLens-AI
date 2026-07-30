import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F1',
        ink: '#1E2A25',
        forest: {
          50: '#EEF3F0',
          100: '#D7E4DB',
          300: '#88AC97',
          500: '#3E7458',
          600: '#2F5D45',
          700: '#234A36'
        },
        clay: {
          400: '#D98E4A',
          500: '#C97A2B',
          600: '#A9631F'
        },
        flag: {
          400: '#C96257',
          500: '#B14A3D'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '14px'
      }
    }
  },
  plugins: []
};
export default config;
