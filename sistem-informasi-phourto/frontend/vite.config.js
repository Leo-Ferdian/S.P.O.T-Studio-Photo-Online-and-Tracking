// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // ✅ Tambahkan ini supaya @ menunjuk ke folder src
      '@': fileURLToPath(new URL('./src', import.meta.url)),

      // Tetap pertahankan konfigurasi vue kamu
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
})