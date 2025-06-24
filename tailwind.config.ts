import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'trash-green': '#1a3c34', // Dark green for Oscar's vibe
        'trash-yellow': '#f4ca16', // Bright yellow for trash can lids
      },
    },
  },
  plugins: [],
};

export default config;