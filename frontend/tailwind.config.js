 /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app.vue",  // Nuxt 3 app component
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  safelist: [
    // Preserve iridescent theme classes (used dynamically)
    'gradient-chaos',
    'gradient-pulse',
    'iridescent-glow',
    'bg-iridescent',
    'bg-iridescent-hover',
    'bg-iridescent-secondary',
    'bg-iridescent-tertiary',
    'shadow-iridescent',
    'shadow-iridescent-lg',
    'shadow-iridescent-xl',
  ],
  theme: {
    screens: {
      'xs': '320px',  // iPhone SE, small phones
      'sm': '375px',  // iPhone 12/13, standard phones
      'md': '768px',  // iPad, tablets
      'lg': '1024px', // desktop
      'xl': '1280px', // large desktop
      '2xl': '1536px' // extra large desktop
    },
    extend: {
      animation: {
        'gradient-chaos': 'gradient-chaos 3s ease infinite',
        'gradient-pulse': 'gradient-pulse 2s ease-in-out infinite',
        'iridescent-glow': 'iridescent-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-chaos': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'gradient-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'iridescent-glow': {
          '0%, 100%': {
            'box-shadow': '0 4px 12px rgba(236, 72, 153, 0.15), 0 2px 6px rgba(249, 115, 22, 0.15), 0 1px 3px rgba(59, 130, 246, 0.15)'
          },
          '50%': {
            'box-shadow': '0 8px 24px rgba(236, 72, 153, 0.25), 0 4px 12px rgba(249, 115, 22, 0.25), 0 2px 6px rgba(59, 130, 246, 0.25)'
          },
        },
      },
      backgroundImage: {
        'iridescent': 'linear-gradient(45deg, #ff1493, #ff6b00, #00bfff)',
        'iridescent-hover': 'linear-gradient(45deg, #ff69b4, #ff8c00, #1e90ff)',
        'iridescent-secondary': 'linear-gradient(45deg, rgba(255, 20, 147, 0.2), rgba(255, 107, 0, 0.2), rgba(0, 191, 255, 0.2))',
        'iridescent-tertiary': 'linear-gradient(45deg, rgba(255, 20, 147, 0.1), rgba(255, 107, 0, 0.1), rgba(0, 191, 255, 0.1))',
      },
      boxShadow: {
        'iridescent': '0 4px 12px rgba(255, 20, 147, 0.25), 0 2px 6px rgba(255, 107, 0, 0.25), 0 1px 3px rgba(0, 191, 255, 0.25)',
        'iridescent-lg': '0 8px 24px rgba(255, 20, 147, 0.35), 0 4px 12px rgba(255, 107, 0, 0.35), 0 2px 6px rgba(0, 191, 255, 0.35)',
        'iridescent-xl': '0 12px 32px rgba(255, 20, 147, 0.45), 0 6px 16px rgba(255, 107, 0, 0.45), 0 3px 8px rgba(0, 191, 255, 0.45)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
