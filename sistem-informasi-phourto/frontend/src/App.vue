<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.stores';
import router from './router';
import feather from 'feather-icons';

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};

// Pastikan ikon di-render setelah komponen dimuat dan setiap kali rute berubah
onMounted(() => {
  feather.replace();
});
router.afterEach(() => {
  setTimeout(() => feather.replace(), 0);
});
</script>

<template>
  <div class="bg-[#0F0F0F] text-white min-h-screen font-sans">
    <header class="bg-[#141414]/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#333333]">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold tracking-wider">
              PHOUR.TO
            </router-link>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-6">
              <router-link to="/" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Beranda</router-link>
              </div>
          </div>
          <div class="hidden md:block">
            <div v-if="!authStore.isLoggedIn" class="ml-4 flex items-center md:ml-6 space-x-4">
              <router-link to="/login" class="font-medium py-2 px-5 rounded-lg transition duration-300 hover:bg-[#2a2a2a]">
                Masuk
              </router-link>
              <router-link to="/register" class="bg-[#2E6CF8] hover:bg-[#2558c7] font-semibold py-2 px-5 rounded-lg transition duration-300">
                Daftar
              </router-link>
            </div>
            <div v-else class="ml-4 flex items-center md:ml-6 space-x-4">
              <router-link to="/dashboard" class="font-medium py-2 px-5 rounded-lg transition duration-300 hover:bg-[#2a2a2a]">
                Dashboard
              </router-link>
              <button @click="handleLogout" class="bg-red-600 hover:bg-red-700 font-semibold py-2 px-5 rounded-lg transition duration-300">
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-[#141414] border-t border-[#333333] mt-20">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
        <p class="text-2xl font-bold text-white tracking-wider mb-4">PHOUR.TO</p>
        <p>&copy; {{ new Date().getFullYear() }} Phour.to. All rights reserved.</p>
        <p class="text-sm mt-2">Powered by S.P.O.T System</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Style untuk transisi fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Mengganti font utama sesuai desain figma */
body {
    font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>