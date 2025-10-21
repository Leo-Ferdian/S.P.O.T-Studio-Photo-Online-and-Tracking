/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#FFFF00', // Kuning
        'text-default': '#000000', // Hitam
        'text-inverse': '#FFFFFF', // Putih
        'primary': '#FF0000', // Merah
        'outline': '#000000', // Hitam
        'accent-green': '#00FF00', // Hijau
        'accent-blue': '#0000FF', // Biru
        'cream': '#FDFCEC', // Cream

        // Warna spesifik untuk border dan shadow agar konsisten
        'outline': '#000000',
      },
      // ↑↑↑ SAMPAI SINI ↑↑↑

      // Konfigurasi lain yang sudah kita buat sebelumnya
      fontFamily: {
        // 'sans': ['Roboto', 'sans-serif'],
        // 'display': ['"Press Start 2P"', 'cursive'],
        'sans': ['"Kode Mono"', 'monospace'],
        'display': ['"Kode Mono"', 'monospace']
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'solid': '4px 4px 0 #000', // Shadow solid khas desain retro
      }
    },
  },
  plugins: [],
}