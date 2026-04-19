import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zionsville palette — warm brick + village green
        brick: {
          50:  '#fdf6f0',
          100: '#fae8d8',
          200: '#f4ccaa',
          300: '#ecab74',
          400: '#e3833c',
          500: '#d96620',
          600: '#c05018',
          700: '#9e3d16',
          800: '#7e3119',
          900: '#672a18',
        },
        village: {
          50:  '#f3f7f3',
          100: '#e2ede2',
          200: '#c5dbc6',
          300: '#9cbf9e',
          400: '#6e9e72',
          500: '#4d8052',
          600: '#3a6640',
          700: '#305235',
          800: '#28422c',
          900: '#213725',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
