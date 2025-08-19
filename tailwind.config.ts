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
        'trash-brown': '#8B4513', // Brown for dirt/trash
        'trash-gray': '#2F4F4F', // Dark gray for metal
        'garbage-blue': '#4682B4', // Blue for recycling
        'compost-orange': '#FF8C00', // Orange for organic waste
      },
      fontFamily: {
        'trash': ['Comic Sans MS', 'cursive'],
        'garbage': ['Impact', 'Charcoal', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'trash-bounce': 'trash-bounce 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #f4ca16' },
          '50%': { boxShadow: '0 0 20px #f4ca16, 0 0 30px #f4ca16' },
        },
        'trash-bounce': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(2deg)' },
          '50%': { transform: 'scale(1.05) rotate(-1deg)' },
          '75%': { transform: 'scale(1.1) rotate(1deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'trash-gradient': 'linear-gradient(135deg, #1a3c34 0%, #2d5a4f 50%, #000000 100%)',
        'garbage-radial': 'radial-gradient(ellipse at center, #2d5a4f 0%, #1a3c34 70%, #000000 100%)',
        'oscar-pattern': 'repeating-linear-gradient(45deg, #1a3c34, #1a3c34 10px, #2d5a4f 10px, #2d5a4f 20px)',
      },
      boxShadow: {
        'trash': '0 10px 25px -5px rgba(26, 60, 52, 0.8)',
        'garbage': '0 20px 40px -10px rgba(244, 202, 22, 0.3)',
        'oscar': '0 25px 50px -12px rgba(244, 202, 22, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
        '110': '1.1',
      },
      transitionProperty: {
        'all': 'all',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'transform': 'transform',
      },
    },
  },
  plugins: [],
};

export default config;