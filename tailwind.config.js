/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f0f7ff', 100:'#e0effe', 200:'#bae0fd', 300:'#7cc8fb', 400:'#38aaf4', 500:'#0e90e0', 600:'#0271bf', 700:'#035a9a', 800:'#074d7f', 900:'#0a3f69' },
        dark: { 900:'#0a0f1a', 800:'#0f1626', 700:'#151e33', 600:'#1c2844', 500:'#253357' }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Cairo', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp: { from:{ opacity:0, transform:'translateY(16px)' }, to:{ opacity:1, transform:'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
