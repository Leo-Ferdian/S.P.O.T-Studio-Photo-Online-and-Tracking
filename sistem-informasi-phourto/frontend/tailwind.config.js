/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nama semantik untuk peran warna
        'background': '#F7F500', // Latar belakang utama halaman
        'primary': '#FF1B1B',    // Untuk Tombol, Judul Section, Aksen Utama
        
        // Objek untuk variasi warna teks
        'text': {
          'default': '#000000', // Warna teks utama di atas background kuning
          'inverse': '#FFFFFF', // Warna teks di atas background berwarna (misal: di tombol merah)
          'subtle': '#555555',  // Warna teks sekunder (misal: di footer)
        },

        // Warna aksen untuk elemen dekoratif seperti border
        'accent': {
          'green': '#00F900',
          'blue': '#0008FF',
        },

        // Warna spesifik untuk border dan shadow agar konsisten
        'outline': '#000000',
      },
      // ↑↑↑ SAMPAI SINI ↑↑↑

      // Konfigurasi lain yang sudah kita buat sebelumnya
      fontFamily: {
        // 'sans': ['Roboto', 'sans-serif'],
        // 'display': ['"Press Start 2P"', 'cursive'],
        'sans': ['"Kode Mono"', 'monospace'],
        'mono': ['"Kode Mono"', 'monospace']
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