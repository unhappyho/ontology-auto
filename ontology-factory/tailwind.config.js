/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2F54EB', light: '#F0F5FF' },
        'text-main': '#1D2129',
        'text-regular': '#4E5969',
        'text-secondary': '#86909C',
        'border-color': '#E5E6EB',
        'bg-body': '#F7F8FA',
        'bg-white': '#FFFFFF',
        success: '#00B42A',
        warning: '#FF7D00',
        danger: '#F53F3F',
        processing: '#165DFF',
        'step1': '#165DFF',
        'step2': '#722ED1',
        'step3': '#FA8C16',
        'step4': '#00B42A',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
