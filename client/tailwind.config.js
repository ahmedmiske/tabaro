/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Colores de tu marca usando variables CSS para consistencia
        'brand-green': 'var(--brand-green)',
        'brand-green-600': 'var(--brand-green-600)',
        'brand-orange': 'var(--brand-orange)',
        'brand-orange-600': 'var(--brand-orange-600)',
        'ui-primary': 'var(--ui-primary)',
        'ui-primary-600': 'var(--ui-primary-600)',
        'ui-accent': 'var(--ui-accent)',
        'ui-accent-600': 'var(--ui-accent-600)',
        'text-color': 'var(--text-color)',
        'text-muted': 'var(--text-muted)',
        'bg-page': 'var(--bg-page)',
        'border-color': 'var(--color-border)',
      },
      fontFamily: {
        'cairo': ['Cairo', 'system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
        'roboto': ['Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '22px',
      },
      boxShadow: {
        '1': '0 4px 16px rgba(0,0,0,.08)',
        '2': '0 12px 40px rgba(0,0,0,.14)',
      },
      transitionDuration: {
        'main': '0.3s',
      }
    },
  },
  plugins: [],
}